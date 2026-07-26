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

  // Fetch all members to check for bots
  await guild.members.fetch();
  const totalMembers = guild.memberCount;
  const botMembers = guild.members.cache.filter((m) => m.user.bot).size;
  const realMembers = totalMembers - botMembers;

  verification.memberCount = realMembers;
  await verification.save();

  logger.info(`Verification check: ${guild.name} — ${totalMembers} total, ${botMembers} bots, ${realMembers} real members`);

  // Anti-bot check: if more than 10% are bots, deny
  const botPercentage = totalMembers > 0 ? (botMembers / totalMembers) * 100 : 100;
  if (botPercentage > 10) {
    try {
      const owner = await client.users.fetch(verification.ownerId);
      await owner.send(`❌ Your clan **${verification.clanName}** could not be verified. Your server has too many bot accounts (${botMembers} bots out of ${totalMembers} members). Please remove bot accounts and try again.`);
    } catch { /* DM failed */ }
    verification.status = 'DENIED';
    await verification.save();
    await guild.leave();
    return;
  }

  // Check minimum real member requirement
  if (realMembers < config.settings.minClanMembers) {
    try {
      const owner = await client.users.fetch(verification.ownerId);
      await owner.send(`❌ Your clan **${verification.clanName}** could not be verified. Your server has ${realMembers} real members (excluding ${botMembers} bots), but the minimum is ${config.settings.minClanMembers}.`);
    } catch { /* DM failed */ }
    verification.status = 'DENIED';
    await verification.save();
    await guild.leave();
    return;
  }

  // Auto-approve — 100+ real members, not many bots
  await guild.leave();
  logger.info(`Verification check complete for ${verification.clanName} (${realMembers} real members, ${botMembers} bots). Auto-approved. Bot left the clan server.`);

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

  // DM the owner with verification success
  try {
    const owner = await client.users.fetch(verification.ownerId);
    const warInvite = 'https://discord.gg/' + config.war.guildId;
    const { content, embed, components } = buildVerificationDMEmbed(`<@${owner.id}>`, clan.mainerCode, warInvite);
    await owner.send({ content, embeds: [embed], components: [components] });
  } catch { /* DM failed */ }

  logger.info(`Clan ${clan.name} verified and added to ${verification.region} leaderboard.`);
}

async function getNextRank(region: string): Promise<number> {
  const clans = await Clan.find({ 'regions.region': region, status: 'ACTIVE' });
  const ranks = clans.flatMap((c) => c.regions.filter((r) => r.region === region).map((r) => r.rank));
  return ranks.length > 0 ? Math.max(...ranks) + 1 : 1;
}
