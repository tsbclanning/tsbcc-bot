import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Mainer } from '../../database/models/Mainer.js';
import { Clan } from '../../database/models/Clan.js';

export const wareligibleCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('wareligible')
    .setDescription('Check if a player is war eligible and which clan they main for')
    .addStringOption((opt) => opt.setName('user_id').setDescription('Discord user ID to check').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    const userId = interaction.options.getString('user_id')!;
    const mainers = await Mainer.find({ userId });

    if (mainers.length === 0) {
      await interaction.reply({ content: `<@${userId}> is not a mainer for any clan.`, ephemeral: true });
      return;
    }

    let result = '';
    for (const mainer of mainers) {
      const clan = await Clan.findOne({ clanId: mainer.clanId });
      const eligible = new Date() >= mainer.warEligibleAt;
      const eligibleDate = mainer.warEligibleAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const status = eligible ? '✅ War Eligible' : `❌ Not eligible until ${eligibleDate}`;
      result += `**${clan?.name ?? 'Unknown'}** (${mainer.region}): ${status}\n`;
    }

    await interaction.reply({ content: `<@${userId}>:\n${result}`, ephemeral: true });
  },
};
