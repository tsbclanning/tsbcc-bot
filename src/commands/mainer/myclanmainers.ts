import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Clan } from '../../database/models/Clan.js';
import { Mainer } from '../../database/models/Mainer.js';

export const myclanmainersCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('myclanmainers')
    .setDescription('View your clan\'s mainers')
    .addStringOption((opt) => opt.setName('region').setDescription('Region').setRequired(true).addChoices(
      { name: 'EU', value: 'EU' }, { name: 'AS', value: 'AS' }, { name: 'NA', value: 'NA' }, { name: 'SA', value: 'SA' }, { name: 'OCE', value: 'OCE' },
    )) as SlashCommandBuilder,
  async execute(interaction) {
    const region = interaction.options.getString('region')!;
    const clan = await Clan.findOne({ ownerId: interaction.user.id });
    if (!clan) {
      await interaction.reply({ content: 'You do not own a clan.', ephemeral: true });
      return;
    }
    const mainers = await Mainer.find({ clanId: clan.clanId, region });
    if (mainers.length === 0) {
      await interaction.reply({ content: `No mainers for **${clan.name}** in ${region}.`, ephemeral: true });
      return;
    }
    const list = mainers.map((m, i) => `${i + 1}. <@${m.userId}> (${m.robloxUsername}) — War eligible: ${m.warEligibleAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`).join('\n');
    await interaction.reply({ content: `**${clan.name}** — ${region} Mainers (${mainers.length}):\n${list}`, ephemeral: true });
  },
};
