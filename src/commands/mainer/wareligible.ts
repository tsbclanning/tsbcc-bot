import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Mainer } from '../../database/models/Mainer.js';
import { Clan } from '../../database/models/Clan.js';
import { isReferee, isStaff } from '../../utils/permissions.js';

export const wareligibleCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('check')
    .setDescription('Check if a player is war eligible and which clan they main for (Referees only)')
    .addStringOption((opt) => opt.setName('user_id').setDescription('Discord user ID to check').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    if (!isReferee(interaction.member as any) && !isStaff(interaction.member as any)) {
      await interaction.reply({ content: 'Referees and staff only.', ephemeral: true });
      return;
    }

    const userId = interaction.options.getString('user_id')!;
    const mainers = await Mainer.find({ userId });

    if (mainers.length === 0) {
      const embed = new EmbedBuilder()
        .setTitle('War Eligibility Check')
        .setDescription(`<@${userId}> is not a mainer for any clan.`)
        .setColor(0xed4245);
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('War Eligibility Check')
      .setColor(0x5865f2);

    for (const mainer of mainers) {
      const clan = await Clan.findOne({ clanId: mainer.clanId });
      const eligible = new Date() >= mainer.warEligibleAt;
      const eligibleDate = mainer.warEligibleAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const status = eligible ? '✅ War Eligible' : `❌ Not eligible until ${eligibleDate}`;
      const regionData = clan?.regions.find((r) => r.region === mainer.region);
      const rankStr = regionData ? ` (#${regionData.rank})` : '';

      embed.addFields({
        name: `${clan?.name ?? 'Unknown'}${rankStr} — ${mainer.region}`,
        value: `Player: <@${userId}>\nRoblox: ${mainer.robloxUsername}\nStatus: ${status}`,
        inline: false,
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
