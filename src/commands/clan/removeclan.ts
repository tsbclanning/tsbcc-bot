import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Clan } from '../../database/models/Clan.js';
import { isAdmin } from '../../utils/permissions.js';

export const removeclanCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('removeclan')
    .setDescription('Remove a clan from the system')
    .addStringOption((opt) => opt.setName('server_id').setDescription('Clan server ID').setRequired(false))
    .addStringOption((opt) => opt.setName('region').setDescription('Region to remove from').setRequired(false)) as SlashCommandBuilder,
  async execute(interaction) {
    if (!isAdmin(interaction.member as any)) {
      await interaction.reply({ content: 'Admin only.', ephemeral: true });
      return;
    }

    const serverId = interaction.options.getString('server_id');
    const region = interaction.options.getString('region');

    if (!serverId) {
      await interaction.reply({ content: 'Please provide a server ID.', ephemeral: true });
      return;
    }

    const clan = await Clan.findOne({ serverId });
    if (!clan) {
      await interaction.reply({ content: 'No clan found.', ephemeral: true });
      return;
    }

    if (region) {
      clan.regions = clan.regions.filter((r) => r.region !== region);
      await clan.save();
      await interaction.reply({ content: `Removed **${clan.name}** from ${region}.`, ephemeral: true });
    } else {
      clan.status = 'DISBANDED';
      await clan.save();
      await interaction.reply({ content: `Removed **${clan.name}** from all regions.`, ephemeral: true });
    }
  },
};
