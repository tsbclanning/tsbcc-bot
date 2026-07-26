import type { Client, TextChannel } from 'discord.js';
import { config } from '../config/index.js';
import { buildClanManagementEmbed } from '../utils/embeds.js';
import { logger } from '../utils/logger.js';

export async function setupClanManagementPanel(client: Client): Promise<void> {
  const channelId = config.community.channels.clanManagement;
  if (!channelId) {
    logger.warn('CLAN_MANAGEMENT channel ID not set, skipping panel setup');
    return;
  }

  const channel = await client.channels.fetch(channelId) as TextChannel | null;
  if (!channel) {
    logger.warn(`Channel ${channelId} not found for clan management panel`);
    return;
  }

  // Check if panel already exists
  const messages = await channel.messages.fetch({ limit: 5 });
  const existing = messages.find((m) => m.author.id === client.user?.id);

  const [embed, row] = buildClanManagementEmbed();

  if (existing) {
    await existing.edit({ embeds: [embed], components: [row] });
  } else {
    await channel.send({ embeds: [embed], components: [row] });
  }

  logger.info('Clan management panel initialized');
}
