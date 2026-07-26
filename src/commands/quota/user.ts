import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Quota } from '../../database/models/Quota.js';
import { Clan } from '../../database/models/Clan.js';
import { EmbedBuilder } from 'discord.js';

export const quotaUserCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('quota-user')
    .setDescription('Displays quota statistics for a user')
    .addStringOption((opt) => opt.setName('user_id').setDescription('Discord user ID').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    const userId = interaction.options.getString('user_id')!;
    const quotas = await Quota.find({ userId });
    if (quotas.length === 0) {
      await interaction.reply({ content: 'No quota data for this user.', ephemeral: true });
      return;
    }
    let desc = '';
    for (const q of quotas) {
      const clan = await Clan.findOne({ clanId: q.clanId });
      desc += `**${clan?.name ?? 'Unknown'}** (${q.region}): ${q.warsParticipated} wars participated, ${q.warsHosted} hosted\n`;
    }
    const embed = new EmbedBuilder().setTitle(`Quota Stats — <@${userId}>`).setDescription(desc).setColor(0x5865f2);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
