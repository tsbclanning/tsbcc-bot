import { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { SelectCustomId } from '../../types/index.js';

export const refreshCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('refresh')
    .setDescription('Refresh the leaderboard (delete and resend)')
    .addStringOption((opt) => opt.setName('region').setDescription('Pick a region or all').setRequired(true).addChoices(
      { name: 'EU', value: 'EU' },
      { name: 'AS', value: 'AS' },
      { name: 'NA', value: 'NA' },
      { name: 'SA', value: 'SA' },
      { name: 'OCE', value: 'OCE' },
      { name: 'All Regions', value: 'ALL' },
    )) as SlashCommandBuilder,
  async execute(interaction) {
    const region = interaction.options.getString('region')!;
    if (region === 'ALL') {
      const { refreshAllLeaderboards } = await import('../../services/leaderboard.js');
      await refreshAllLeaderboards(interaction.client);
    } else {
      const { refreshLeaderboard } = await import('../../services/leaderboard.js');
      await refreshLeaderboard(interaction.client, region);
    }
    await interaction.reply({ content: `Leaderboard refreshed for ${region === 'ALL' ? 'all regions' : region}.`, ephemeral: true });
  },
};
