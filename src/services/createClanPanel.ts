import type { Client, TextChannel } from 'discord.js';
import { config } from '../config/index.js';
import { buildApplyClanVerifyEmbed, buildClaimClanLeaderEmbed, buildWelcomeEmbed, buildRobloxVerifyPanelEmbed } from '../utils/embeds.js';
import { logger } from '../utils/logger.js';

export async function setupCreateClanPanel(client: Client): Promise<void> {
  const channelId = config.community.channels.createClan;
  if (!channelId) return;

  const channel = await client.channels.fetch(channelId) as TextChannel | null;
  if (!channel) return;

  // Delete old bot messages and resend fresh
  const messages = await channel.messages.fetch({ limit: 10 });
  const botMessages = messages.filter((m) => m.author.id === client.user?.id);
  for (const [, msg] of botMessages) {
    await msg.delete().catch(() => {});
  }

  const [applyEmbed, applyRow] = buildApplyClanVerifyEmbed();
  const [claimEmbed, claimRow] = buildClaimClanLeaderEmbed();

  await channel.send({ embeds: [applyEmbed], components: [applyRow] });
  await channel.send({ embeds: [claimEmbed], components: [claimRow] });

  logger.info('Create clan panel initialized');
}

export async function setupWelcomePanel(client: Client): Promise<void> {
  const channelId = config.community.channels.verification;
  if (!channelId) return;

  const channel = await client.channels.fetch(channelId) as TextChannel | null;
  if (!channel) return;

  // Delete old bot messages and resend fresh
  const messages = await channel.messages.fetch({ limit: 10 });
  const botMessages = messages.filter((m) => m.author.id === client.user?.id);
  for (const [, msg] of botMessages) {
    await msg.delete().catch(() => {});
  }

  const [welcomeEmbed, welcomeRow] = buildWelcomeEmbed();
  await channel.send({ embeds: [welcomeEmbed], components: [welcomeRow] });

  // Also send Roblox verification panel
  const [verifyEmbed, verifyRow] = buildRobloxVerifyPanelEmbed();
  await channel.send({ embeds: [verifyEmbed], components: [verifyRow] });

  logger.info('Welcome + Roblox verify panel initialized');
}
