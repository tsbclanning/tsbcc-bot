import type { Client, TextChannel } from 'discord.js';
import { Clan } from '../database/models/Clan.js';
import { config } from '../config/index.js';
import { Region } from '../types/index.js';
import { buildLeaderboardEmbed } from '../utils/embeds.js';
import { logger } from '../utils/logger.js';

const channelMap: Record<string, string> = {
  [Region.EU]: config.community.channels.clEu,
  [Region.AS]: config.community.channels.clAs,
  [Region.NA]: config.community.channels.clNa,
  [Region.SA]: config.community.channels.clSa,
  [Region.OCE]: config.community.channels.clOce,
};

export async function initLeaderboards(client: Client): Promise<void> {
  for (const region of Object.values(Region)) {
    const channelId = channelMap[region];
    if (!channelId) continue;
    try {
      const channel = await client.channels.fetch(channelId) as TextChannel | null;
      if (!channel) continue;

      // Check if there's already a leaderboard message
      const messages = await channel.messages.fetch({ limit: 5 });
      const existing = messages.find((m) => m.author.id === client.user?.id);

      if (!existing) {
        const clans = await getSortedClans(region);
        const embeds = buildLeaderboardEmbed(region, clans);
        await channel.send({ embeds });
        logger.info(`Initialized leaderboard for ${region}`);
      }
    } catch (error) {
      logger.error(`Failed to init leaderboard for ${region}:`, error);
    }
  }
}

export async function updateLeaderboard(client: Client, region: string): Promise<void> {
  const channelId = channelMap[region];
  if (!channelId) return;

  try {
    const channel = await client.channels.fetch(channelId) as TextChannel | null;
    if (!channel) return;

    const clans = await getSortedClans(region);
    const embeds = buildLeaderboardEmbed(region, clans);

    const messages = await channel.messages.fetch({ limit: 5 });
    const existing = messages.find((m) => m.author.id === client.user?.id);

    if (existing) {
      await existing.edit({ embeds });
    } else {
      await channel.send({ embeds });
    }
    logger.info(`Updated leaderboard for ${region}`);
  } catch (error) {
    logger.error(`Failed to update leaderboard for ${region}:`, error);
  }
}

export async function refreshLeaderboard(client: Client, region: string): Promise<void> {
  const channelId = channelMap[region];
  if (!channelId) return;

  try {
    const channel = await client.channels.fetch(channelId) as TextChannel | null;
    if (!channel) return;

    // Delete old messages from the bot
    const messages = await channel.messages.fetch({ limit: 10 });
    const botMessages = messages.filter((m) => m.author.id === client.user?.id);
    for (const [, msg] of botMessages) {
      await msg.delete().catch(() => {});
    }

    // Resend fresh
    const clans = await getSortedClans(region);
    const embeds = buildLeaderboardEmbed(region, clans);
    await channel.send({ embeds });
    logger.info(`Refreshed leaderboard for ${region} (deleted and resent)`);
  } catch (error) {
    logger.error(`Failed to refresh leaderboard for ${region}:`, error);
  }
}

export async function refreshAllLeaderboards(client: Client): Promise<void> {
  for (const region of Object.values(Region)) {
    await refreshLeaderboard(client, region);
  }
}

async function getSortedClans(region: string) {
  const clans = await Clan.find({ 'regions.region': region, status: 'ACTIVE' });
  const sorted = clans.sort((a, b) => {
    const rankA = a.regions.find((r) => r.region === region)?.rank ?? 999;
    const rankB = b.regions.find((r) => r.region === region)?.rank ?? 999;
    return rankA - rankB;
  });
  return sorted;
}
