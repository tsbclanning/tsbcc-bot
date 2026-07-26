import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Warning } from '../../database/models/Warning.js';
import { Clan } from '../../database/models/Clan.js';
import { isAdmin } from '../../utils/permissions.js';

export const clearwarnsCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('clearwarns')
    .setDescription('Clear all warnings from a clan\'s record')
    .addStringOption((opt) => opt.setName('clan_name').setDescription('Clan name').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    if (!isAdmin(interaction.member as any)) {
      await interaction.reply({ content: 'Admin only.', ephemeral: true });
      return;
    }
    const clanName = interaction.options.getString('clan_name')!;
    const clan = await Clan.findOne({ name: { $regex: new RegExp(clanName, 'i') } });
    if (!clan) {
      await interaction.reply({ content: 'Clan not found.', ephemeral: true });
      return;
    }
    await Warning.updateMany({ clanId: clan.clanId, active: true }, { active: false });
    await interaction.reply({ content: `All warnings cleared for **${clan.name}**.`, ephemeral: true });
  },
};
