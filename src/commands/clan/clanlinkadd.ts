import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Clan } from '../../database/models/Clan.js';

export const clanlinkaddCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('clanlinkadd')
    .setDescription('Add an invite link to your clan profile')
    .addStringOption((opt) => opt.setName('link').setDescription('Discord invite link').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    const link = interaction.options.getString('link')!;
    const clan = await Clan.findOne({ ownerId: interaction.user.id });
    if (!clan) {
      await interaction.reply({ content: 'You do not own a clan.', ephemeral: true });
      return;
    }
    clan.inviteLinks.push(link);
    await clan.save();
    await interaction.reply({ content: `Invite link added to **${clan.name}**.`, ephemeral: true });
  },
};
