import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { isBotOwner } from '../../utils/permissions.js';

export const sayCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Force the bot to send a message (Bot Owner only)')
    .addStringOption((opt) => opt.setName('message').setDescription('Message to send').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    if (!isBotOwner(interaction.user.id)) {
      await interaction.reply({ content: 'Bot owner only.', ephemeral: true });
      return;
    }
    const message = interaction.options.getString('message')!;
    await (interaction.channel as any)?.send(message);
    await interaction.reply({ content: 'Message sent.', ephemeral: true });
  },
};
