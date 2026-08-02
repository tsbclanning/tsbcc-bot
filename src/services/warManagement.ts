import type { Client, TextChannel } from 'discord.js';
import { config } from '../config/index.js';
import { buildCwmAssignEmbed, buildCwmRemoveEmbed, buildCwm2ResignEmbed, buildChallengePanelEmbed } from '../utils/embeds.js';
import { logger } from '../utils/logger.js';

export async function setupCwmPanel(client: Client): Promise<void> {
  const channelId = config.war.channels.cwm;
  if (!channelId) return;

  const channel = await client.channels.fetch(channelId) as TextChannel | null;
  if (!channel) return;

  // Delete old messages and resend fresh
  const messages = await channel.messages.fetch({ limit: 10 });
  const botMessages = messages.filter((m) => m.author.id === client.user?.id);
  for (const [, msg] of botMessages) {
    await msg.delete().catch(() => {});
  }

  const [assignEmbed, assignRow] = buildCwmAssignEmbed();
  const [removeEmbed, removeRow] = buildCwmRemoveEmbed();

  await channel.send({ embeds: [assignEmbed], components: [assignRow] });
  await channel.send({ embeds: [removeEmbed], components: [removeRow] });

  logger.info('CWM panel initialized');
}

export async function setupCwm2Panel(client: Client): Promise<void> {
  const channelId = config.war.channels.cwm2;
  if (!channelId) return;

  const channel = await client.channels.fetch(channelId) as TextChannel | null;
  if (!channel) return;

  // Delete old messages and resend fresh
  const messages = await channel.messages.fetch({ limit: 5 });
  const botMessages = messages.filter((m) => m.author.id === client.user?.id);
  for (const [, msg] of botMessages) {
    await msg.delete().catch(() => {});
  }

  const [resignEmbed, resignRow] = buildCwm2ResignEmbed();
  await channel.send({ embeds: [resignEmbed], components: [resignRow] });

  logger.info('CWM2 resign panel initialized');
}

export async function setupChallengePanel(client: Client): Promise<void> {
  const channelId = config.war.channels.warTickets;
  if (!channelId) return;

  const channel = await client.channels.fetch(channelId) as TextChannel | null;
  if (!channel) return;

  // Delete old messages and resend fresh
  const messages = await channel.messages.fetch({ limit: 5 });
  const botMessages = messages.filter((m) => m.author.id === client.user?.id);
  for (const [, msg] of botMessages) {
    await msg.delete().catch(() => {});
  }

  const [embed, row] = buildChallengePanelEmbed();
  await channel.send({ embeds: [embed], components: [row] });

  logger.info('Challenge panel initialized');
}
