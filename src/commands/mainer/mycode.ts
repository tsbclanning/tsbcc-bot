import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Clan } from '../../database/models/Clan.js';

export const mycodeCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('mycode')
    .setDescription("Check your clan's mainer code") as SlashCommandBuilder,
  async execute(interaction) {
    const clan = await Clan.findOne({ ownerId: interaction.user.id });
    if (!clan) {
      await interaction.reply({ content: 'You do not own a clan.', ephemeral: true });
      return;
    }
    await interaction.reply({ content: `Your mainer code is: **${clan.mainerCode}**\nGive this to players you want to main your clan. They use \`/mainclan\` with this code.`, ephemeral: true });
  },
};
