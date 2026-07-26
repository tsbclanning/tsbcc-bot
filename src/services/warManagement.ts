import type { Client, TextChannel } from 'discord.js';
import { config } from '../config/index.js';
import { buildCwmAssignEmbed, buildCwmRemoveEmbed, buildChallengePanelEmbed } from '../utils/embeds.js';
import { logger } from '../utils/logger.js';

export async function setupCwmPanel(client: Client): Promise<void> {
  const channelId = config.war.channels.cwm;
  if (!channelId) return;

  const channel = await client.channels.fetch(channelId) as TextChannel | null;
  if (!channel) return;

  const messages = await channel.messages.fetch({ limit: 10 });
  const botMessages = messages.filter((m) => m.author.id === client.user?.id).sorted((a, b) => b.createdTimestamp - a.createdTimestamp);

  const [assignEmbed, assignRow] = buildCwmAssignEmbed();
  const [removeEmbed, removeRow] = buildCwmRemoveEmbed();

  // We need exactly 2 messages: assign + remove
  const msgArray = [...botMessages.values()];

  if (msgArray.length >= 2) {
    await msgArray[0].edit({ embeds: [assignEmbed], components: [assignRow] });
    await msgArray[1].edit({ embeds: [removeEmbed], components: [removeRow] });
  } else {
    // Clear old messages and send fresh
    for (const [, msg] of botMessages) {
      await msg.delete().catch(() => {});
    }
    await channel.send({ embeds: [assignEmbed], components: [assignRow] });
    await channel.send({ embeds: [removeEmbed], components: [removeRow] });
  }

  logger.info('CWM panel initialized');
}

export async function setupChallengePanel(client: Client): Promise<void> {
  const channelId = config.war.channels.warTickets;
  if (!channelId) return;

  const channel = await client.channels.fetch(channelId) as TextChannel | null;
  if (!channel) return;

  const messages = await channel.messages.fetch({ limit: 5 });
  const existing = messages.find((m) => m.author.id === client.user?.id);

  const [embed, row] = buildChallengePanelEmbed();

  if (existing) {
    await existing.edit({ embeds: [embed], components: [row] });
  } else {
    await channel.send({ embeds: [embed], components: [row] });
  }

  logger.info('Challenge panel initialized');
}
