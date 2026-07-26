import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Clan } from '../../database/models/Clan.js';
import { Mainer } from '../../database/models/Mainer.js';
import { isAdmin, isStaff } from '../../utils/permissions.js';

export const clanmainsCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('clanmains')
    .setDescription('Display all mainers of a specific clan in a region (War Managers & Admins only)')
    .addStringOption((opt) => opt.setName('clan_name').setDescription('Clan name').setRequired(true))
    .addStringOption((opt) => opt.setName('region').setDescription('Region').setRequired(true).addChoices(
      { name: 'EU', value: 'EU' }, { name: 'AS', value: 'AS' }, { name: 'NA', value: 'NA' }, { name: 'SA', value: 'SA' }, { name: 'OCE', value: 'OCE' },
    )) as SlashCommandBuilder,
  async execute(interaction) {
    const clanName = interaction.options.getString('clan_name')!;
    const region = interaction.options.getString('region')!;
    const clan = await Clan.findOne({ name: { $regex: new RegExp(clanName, 'i') } });
    if (!clan) {
      await interaction.reply({ content: 'Clan not found.', ephemeral: true });
      return;
    }

    // Only the clan's war manager, clan leader, region lead, or admins can see mainers
    const regionData = clan.regions.find((r) => r.region === region);
    const isClanWM = regionData?.warManager === interaction.user.id;
    const isClanOwner = clan.ownerId === interaction.user.id;
    const isClanRL = regionData?.regionLead === interaction.user.id;

    if (!isClanWM && !isClanOwner && !isClanRL && !isAdmin(interaction.member as any) && !isStaff(interaction.member as any)) {
      await interaction.reply({ content: 'Only the clan\'s War Manager, Clan Leader, Region Lead, or Admins can view mainers.', ephemeral: true });
      return;
    }

    const mainers = await Mainer.find({ clanId: clan.clanId, region });
    if (mainers.length === 0) {
      await interaction.reply({ content: `No mainers found for **${clan.name}** in ${region}.`, ephemeral: true });
      return;
    }
    const list = mainers.map((m, i) => `${i + 1}. <@${m.userId}> (${m.robloxUsername})`).join('\n');
    await interaction.reply({ content: `**${clan.name}** — ${region} Mainers (${mainers.length}):\n${list}`, ephemeral: true });
  },
};
