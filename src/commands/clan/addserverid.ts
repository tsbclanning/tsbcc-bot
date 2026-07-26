import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Clan } from '../../database/models/Clan.js';

export const addserveridCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('addserverid')
    .setDescription('Link a Discord server ID to your clan')
    .addStringOption((opt) => opt.setName('server_id').setDescription('The server ID to link').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    const serverId = interaction.options.getString('server_id')!;
    const clan = await Clan.findOne({ ownerId: interaction.user.id });

    if (!clan) {
      await interaction.reply({ content: 'You do not own a clan.', ephemeral: true });
      return;
    }

    clan.serverId = serverId;
    await clan.save();
    await interaction.reply({ content: `Server ID **${serverId}** linked to clan **${clan.name}**.`, ephemeral: true });
  },
};
