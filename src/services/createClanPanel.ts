import type { Client, TextChannel } from 'discord.js';
import { config } from '../config/index.js';
import { buildApplyClanVerifyEmbed, buildClaimClanLeaderEmbed, buildWelcomeEmbed } from '../utils/embeds.js';
import { logger } from '../utils/logger.js';

export async function setupCreateClanPanel(client: Client): Promise<void> {
  const channelId = config.community.channels.createClan;
  if (!channelId) return;

  const channel = await client.channels.fetch(channelId) as TextChannel | null;
  if (!channel) return;

  const messages = await channel.messages.fetch({ limit: 10 });
  const botMessages = messages.filter((m) => m.author.id === client.user?.id).sorted((a, b) => b.createdTimestamp - a.createdTimestamp);

  const [applyEmbed, applyRow] = buildApplyClanVerifyEmbed();
  const [claimEmbed, claimRow] = buildClaimClanLeaderEmbed();

  const msgArray = [...botMessages.values()];

  if (msgArray.length >= 2) {
    await msgArray[0].edit({ embeds: [applyEmbed], components: [applyRow] });
    await msgArray[1].edit({ embeds: [claimEmbed], components: [claimRow] });
  } else {
    for (const [, msg] of botMessages) {
      await msg.delete().catch(() => {});
    }
    await channel.send({ embeds: [applyEmbed], components: [applyRow] });
    await channel.send({ embeds: [claimEmbed], components: [claimRow] });
  }

  logger.info('Create clan panel initialized');
}

export async function setupWelcomePanel(client: Client): Promise<void> {
  const channelId = config.community.channels.verification;
  if (!channelId) return;

  const channel = await client.channels.fetch(channelId) as TextChannel | null;
  if (!channel) return;

  const messages = await channel.messages.fetch({ limit: 5 });
  const existing = messages.find((m) => m.author.id === client.user?.id);

  const [embed, row] = buildWelcomeEmbed();

  if (existing) {
    await existing.edit({ embeds: [embed], components: [row] });
  } else {
    await channel.send({ embeds: [embed], components: [row] });
  }

  logger.info('Welcome panel initialized');
}
