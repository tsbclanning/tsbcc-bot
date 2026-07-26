import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Warning } from '../../database/models/Warning.js';
import { Clan } from '../../database/models/Clan.js';
import { isAdmin } from '../../utils/permissions.js';

export const removestrikeCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('removestrike')
    .setDescription('Remove an active strike from a clan')
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
    const result = await Warning.updateMany({ clanId: clan.clanId, type: 'STRIKE', active: true }, { active: false });
    await interaction.reply({ content: `Removed ${result.modifiedCount} strike(s) from **${clan.name}**.`, ephemeral: true });
  },
};
