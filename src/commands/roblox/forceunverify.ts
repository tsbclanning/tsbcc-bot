import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Player } from '../../database/models/Player.js';
import { isCompetitiveSupervisor } from '../../utils/permissions.js';

export const robloxForceunverifyCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('roblox-forceunverify')
    .setDescription('Strip a user\'s Roblox verification (Super Admin)')
    .addStringOption((opt) => opt.setName('user_id').setDescription('Discord user ID').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    if (!isCompetitiveSupervisor(interaction.member as any)) {
      await interaction.reply({ content: 'Super Admin only.', ephemeral: true });
      return;
    }
    const userId = interaction.options.getString('user_id')!;
    const result = await Player.updateOne({ userId }, { verified: false, robloxUsername: '', robloxId: '' });
    if (result.modifiedCount === 0) {
      await interaction.reply({ content: 'User not found or not verified.', ephemeral: true });
      return;
    }
    await interaction.reply({ content: `<@${userId}> has been force-unverified.`, ephemeral: true });
  },
};
