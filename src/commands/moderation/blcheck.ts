import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Player } from '../../database/models/Player.js';

export const blcheckCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('blcheck')
    .setDescription('Check if a user is blacklisted')
    .addStringOption((opt) => opt.setName('user_id').setDescription('Discord user ID').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    const userId = interaction.options.getString('user_id')!;
    const player = await Player.findOne({ userId });
    if (!player) {
      await interaction.reply({ content: `<@${userId}> is not in the system.`, ephemeral: true });
      return;
    }
    if (player.blacklisted) {
      await interaction.reply({ content: `❌ <@${userId}> is **BLACKLISTED**.\nReason: ${player.blacklistReason ?? 'N/A'}`, ephemeral: true });
    } else {
      await interaction.reply({ content: `✅ <@${userId}> is not blacklisted.`, ephemeral: true });
    }
  },
};
