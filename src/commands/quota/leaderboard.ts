import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Quota } from '../../database/models/Quota.js';
import { Clan } from '../../database/models/Clan.js';
import { EmbedBuilder } from 'discord.js';

export const quotaLeaderboardCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('quota-leaderboard')
    .setDescription('Displays the quota activity leaderboard') as SlashCommandBuilder,
  async execute(interaction) {
    const quotas = await Quota.find().sort({ warsParticipated: -1 }).limit(20);
    if (quotas.length === 0) {
      await interaction.reply({ content: 'No quota data available.', ephemeral: true });
      return;
    }
    let desc = '';
    for (let i = 0; i < quotas.length; i++) {
      const q = quotas[i];
      const clan = await Clan.findOne({ clanId: q.clanId });
      desc += `${i + 1}. <@${q.userId}> (${clan?.name ?? 'Unknown'}) — ${q.warsParticipated} wars\n`;
    }
    const embed = new EmbedBuilder().setTitle('Quota Leaderboard').setDescription(desc).setColor(0x5865f2);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
