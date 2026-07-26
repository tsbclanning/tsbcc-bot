import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Player } from '../../database/models/Player.js';
import { isCompetitiveSupervisor } from '../../utils/permissions.js';

export const robloxForceverifyCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('roblox-forceverify')
    .setDescription('Manually bind a Discord user to a Roblox account (Super Admin)')
    .addStringOption((opt) => opt.setName('user_id').setDescription('Discord user ID').setRequired(true))
    .addStringOption((opt) => opt.setName('roblox_username').setDescription('Roblox username').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    if (!isCompetitiveSupervisor(interaction.member as any)) {
      await interaction.reply({ content: 'Super Admin only.', ephemeral: true });
      return;
    }
    const userId = interaction.options.getString('user_id')!;
    const robloxUsername = interaction.options.getString('roblox_username')!;

    const response = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [robloxUsername], excludeBannedUsers: true }),
    });
    const data = await response.json() as any;

    if (!data?.data || data.data.length === 0) {
      await interaction.reply({ content: 'Roblox user not found.', ephemeral: true });
      return;
    }

    const robloxUser = data.data[0];
    await Player.findOneAndUpdate(
      { userId },
      { robloxUsername: robloxUser.name, robloxId: robloxUser.id, verified: true },
      { upsert: true },
    );

    await interaction.reply({ content: `<@${userId}> force-verified as **${robloxUser.name}**.`, ephemeral: true });
  },
};
