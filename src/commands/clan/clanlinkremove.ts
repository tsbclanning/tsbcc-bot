import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Clan } from '../../database/models/Clan.js';

export const clanlinkremoveCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('clanlinkremove')
    .setDescription('Remove an invite link from your clan profile')
    .addStringOption((opt) => opt.setName('link').setDescription('Invite link to remove').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    const link = interaction.options.getString('link')!;
    const clan = await Clan.findOne({ ownerId: interaction.user.id });
    if (!clan) {
      await interaction.reply({ content: 'You do not own a clan.', ephemeral: true });
      return;
    }
    clan.inviteLinks = clan.inviteLinks.filter((l) => l !== link);
    await clan.save();
    await interaction.reply({ content: `Invite link removed from **${clan.name}**.`, ephemeral: true });
  },
};
