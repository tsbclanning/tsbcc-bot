import type { Guild, Client } from 'discord.js';
import { logger } from '../utils/logger.js';
import { Verification } from '../database/models/Verification.js';
import { Clan } from '../database/models/Clan.js';
import { generateMainerCode, generateClanId } from '../utils/helpers.js';
import { config } from '../config/index.js';
import { buildVerificationDMEmbed } from '../utils/embeds.js';

export async function execute(guild: Guild, client: Client): Promise<void> {
  // Check if this is a clan verification join
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

  const memberCount = guild.memberCount;
  verification.memberCount = memberCount;
  await verification.save();

  // Check minimum member requirement
  if (memberCount < config.settings.minClanMembers) {
    try {
      const owner = await client.users.fetch(verification.ownerId);
      await owner.send(`❌ Your clan **${verification.clanName}** could not be verified. Your server has ${memberCount} members, but the minimum is ${config.settings.minClanMembers}.`);
    } catch { /* DM failed */ }
    await guild.leave();
    return;
  }

  // Bot leaves after checking
  await guild.leave();
  logger.info(`Verification check complete for ${verification.clanName} (${memberCount} members). Bot left the clan server.`);

  // Create the clan if verification is approved by mods
  // For now, auto-approve (mods can deny later)
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
