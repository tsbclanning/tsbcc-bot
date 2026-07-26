import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Player } from '../../database/models/Player.js';
import { generateRobloxVerifyCode } from '../../utils/helpers.js';
import { buildRobloxProfileEmbed, buildRobloxCodeEmbed } from '../../utils/embeds.js';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

export const robloxVerifyCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('roblox-verify')
    .setDescription('Link your Roblox account to your Discord account') as SlashCommandBuilder,
  async execute(interaction) {
    // Check if already verified
    const existing = await Player.findOne({ userId: interaction.user.id });
    if (existing?.verified) {
      await interaction.reply({ content: 'You are already verified as **' + existing.robloxUsername + '**.', ephemeral: true });
      return;
    }

    // Fetch Roblox user by username (we'll use a simple API call)
    const username = interaction.user.username;
    try {
      const response = await fetch(`${config.roblox.apiUrl}/usernames/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: [username], excludeBannedUsers: true }),
      });
      const data = await response.json() as any;

      if (!data?.data || data.data.length === 0) {
        await interaction.reply({ content: 'Could not find a Roblox user with a matching username. Please ensure your Roblox username matches your Discord username, or contact staff for manual verification.', ephemeral: true });
        return;
      }

      const robloxUser = data.data[0];
      const robloxId = robloxUser.id;
      const robloxUsername = robloxUser.name;

      // Fetch avatar
      const thumbResponse = await fetch(`${config.roblox.thumbApiUrl}?userIds=${robloxId}&size=420x420&format=Png&isCircular=true`);
      const thumbData = await thumbResponse.json() as any;
      const avatarUrl = thumbData?.data?.[0]?.imageUrl ?? '';

      // Create/update player record
      await Player.findOneAndUpdate(
        { userId: interaction.user.id },
        { robloxUsername, robloxId, robloxAvatarUrl: avatarUrl },
        { upsert: true },
      );

      // Show profile and ask to confirm
      const [embed, row] = buildRobloxProfileEmbed(robloxUsername, robloxId, avatarUrl);
      await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    } catch (error) {
      logger.error('Roblox verify error:', error);
      await interaction.reply({ content: 'An error occurred while verifying. Please try again later.', ephemeral: true });
    }
  },
};
