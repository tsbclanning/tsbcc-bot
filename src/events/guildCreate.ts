import type { Guild, Client } from 'discord.js';
import { logger } from '../utils/logger.js';
import { Verification } from '../database/models/Verification.js';
import { Clan } from '../database/models/Clan.js';
import { generateMainerCode, generateClanId } from '../utils/helpers.js';
import { config } from '../config/index.js';
import { buildVerificationDMEmbed } from '../utils/embeds.js';

export async function execute(guild: Guild, client: Client): Promise<void> {
  const verification = await Verification.findOne({
    serverId: guild.id,
    status: 'PENDING',
  });

  if (!verification) {
    logger.info(`Joined guild ${guild.id} (${guild.name}) but no pending verification found. Leaving.`);
    await guild.leave();
    return;
  }

  logger.info(`Bot joined clan server ${guild.name} (${guild.id}) for verification of clan ${verification.clanName}`);

  await guild.members.fetch();
  const totalMembers = guild.memberCount;
  const botMembers = guild.members.cache.filter((m) => m.user.bot).size;
  const realMembers = totalMembers - botMembers;

  verification.memberCount = realMembers;
  await verification.save();

  logger.info(`Verification check: ${guild.name} — ${totalMembers} total, ${botMembers} bots, ${realMembers} real members`);

  // Check if more than 15% are bots
  const botPercentage = totalMembers > 0 ? (botMembers / totalMembers) * 100 : 100;
  if (botPercentage > 15) {
    await denyVerification(client, verification, `Your server has too many bots (**${botPercentage.toFixed(0)}%** of members are bots). Remove bot accounts and re-apply.`);
    await guild.leave();
    return;
  }

  if (realMembers < config.settings.minClanMembers) {
    // Count how many regions they applied for
    const regionCount = await Verification.countDocuments({ ownerId: verification.ownerId, status: 'PENDING' });
    await denyVerification(client, verification, `Your server has **${realMembers}** members. You applied for **${regionCount}** region(s) which requires **${config.settings.minClanMembers}** members. Either grow your server to 100+ members, or reduce your region selection and re-apply.`);
    await guild.leave();
    return;
  }

  // Check if name is already taken
  const existingClan = await Clan.findOne({ name: { $regex: new RegExp(`^${verification.clanName}$`, 'i') }, status: 'ACTIVE' });
  if (existingClan) {
    await denyVerification(client, verification, 'name already taken');
    await guild.leave();
    return;
  }

  // Auto-approve
  await guild.leave();
  logger.info(`Verification approved for ${verification.clanName} (${realMembers} real members, ${botMembers} bots).`);

  verification.status = 'APPROVED';
  await verification.save();

  const clan = await Clan.create({
    clanId: generateClanId(),
    name: verification.clanName,
    ownerId: verification.ownerId,
    serverId: verification.serverId,
    mainerCode: generateMainerCode(),
    status: 'ACTIVE',
    regions: [{
      region: verification.region,
      rank: await getNextRank(verification.region),
      warManager: null,
      regionLead: null,
    }],
  });

  try {
    const owner = await client.users.fetch(verification.ownerId);
    const warInvite = 'https://discord.gg/' + config.war.guildId;
    const { content, embed, components } = buildVerificationDMEmbed(`<@${owner.id}>`, clan.mainerCode, warInvite);
    await owner.send({ content, embeds: [embed], components: [components] });
  } catch { /* DM failed */ }

  logger.info(`Clan ${clan.name} verified and added to ${verification.region} leaderboard.`);
}

async function denyVerification(client: Client, verification: any, reason: string): Promise<void> {
  verification.status = 'DENIED';
  await verification.save();

  // Try to DM the owner
  try {
    const owner = await client.users.fetch(verification.ownerId);
    await owner.send(`Hey, couldn't DM you your denial reason for **${verification.clanName}** but you have been denied for: ${reason}`);
  } catch { /* DM failed */ }

  // Post denial in the TL (denial) channel
  try {
    const channel = await client.channels.fetch(config.community.channels.denial || config.community.channels.createClan).catch(() => null);
    if (channel?.isTextBased()) {
      await (channel as any).send({
        content: `<@${verification.ownerId}> Hey, couldn't DM you your denial reason for **${verification.clanName}** but you have been denied for: ${reason}`,
        allowedMentions: { users: [verification.ownerId] },
      });
    }
  } catch { /* channel not found */ }
}

async function getNextRank(region: string): Promise<number> {
  const clans = await Clan.find({ 'regions.region': region, status: 'ACTIVE' });
  const ranks = clans.flatMap((c: any) => c.regions.filter((r: any) => r.region === region).map((r: any) => r.rank));
  return ranks.length > 0 ? Math.max(...ranks) + 1 : 1;
}
