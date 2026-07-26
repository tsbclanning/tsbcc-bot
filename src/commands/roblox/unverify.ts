import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Player } from '../../database/models/Player.js';

export const robloxUnverifyCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('roblox-unverify')
    .setDescription('Unlink your Roblox account from Discord') as SlashCommandBuilder,
  async execute(interaction) {
    const player = await Player.findOne({ userId: interaction.user.id });
    if (!player || !player.verified) {
      await interaction.reply({ content: 'You are not verified.', ephemeral: true });
      return;
    }
    player.verified = false;
    player.robloxUsername = '';
    player.robloxId = '';
    await player.save();
    await interaction.reply({ content: 'Your Roblox account has been unlinked.', ephemeral: true });
  },
};
