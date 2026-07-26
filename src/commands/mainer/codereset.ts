import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Clan } from '../../database/models/Clan.js';
import { generateMainerCode } from '../../utils/helpers.js';

export const coderesetCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('codereset')
    .setDescription('Reset your clan mainer code if it gets leaked') as SlashCommandBuilder,
  async execute(interaction) {
    const clan = await Clan.findOne({ ownerId: interaction.user.id });
    if (!clan) {
      await interaction.reply({ content: 'You do not own a clan.', ephemeral: true });
      return;
    }
    const oldCode = clan.mainerCode;
    clan.mainerCode = generateMainerCode();
    await clan.save();
    await interaction.reply({ content: `Mainer code reset from **${oldCode}** to **${clan.mainerCode}**.`, ephemeral: true });
  },
};
