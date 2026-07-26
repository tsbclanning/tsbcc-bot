import type { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Player } from '../../database/models/Player.js';
import { generateRobloxVerifyCode } from '../../utils/helpers.js';
import { buildRobloxCodeEmbed } from '../../utils/embeds.js';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

export async function handleRobloxConfirmYes(interaction: ButtonInteraction): Promise<void> {
  const player = await Player.findOne({ userId: interaction.user.id });
  if (!player) {
    await interaction.reply({ content: 'No pending verification found.', ephemeral: true });
    return;
  }

  // Generate verification code
  const code = generateRobloxVerifyCode();
  player.blacklistReason = code; // Store temporarily (reuse field, will clear after)
  await player.save();

  const [embed, row] = buildRobloxCodeEmbed(player.robloxUsername, code);
  await interaction.update({ embeds: [embed], components: [row] });
}

export async function handleRobloxConfirmNo(interaction: ButtonInteraction): Promise<void> {
  await interaction.update({ content: 'Verification cancelled. Please use `/roblox-verify` again when your Roblox username matches.', embeds: [], components: [] });
}

export async function handleRobloxCheckCode(interaction: ButtonInteraction): Promise<void> {
  const player = await Player.findOne({ userId: interaction.user.id });
  if (!player || !player.blacklistReason) {
    await interaction.reply({ content: 'No pending verification found.', ephemeral: true });
    return;
  }

  const code = player.blacklistReason;

  // Fetch Roblox user bio/description
  try {
    const response = await fetch(`https://users.roblox.com/v1/users/${player.robloxId}`);
    const data = await response.json() as any;
    const bio = data?.description ?? '';

    if (bio.includes(code)) {
      player.verified = true;
      player.blacklistReason = null;
      await player.save();

      await interaction.update({ content: `✅ You have been verified as **${player.robloxUsername}**!`, embeds: [], components: [] });
      logger.info(`User ${interaction.user.id} verified as ${player.robloxUsername}`);
    } else {
      await interaction.reply({ content: `❌ Code **${code}** not found in your Roblox bio. Please add it to your Roblox profile description and try again.`, ephemeral: true });
    }
  } catch (error) {
    logger.error('Roblox bio check error:', error);
    await interaction.reply({ content: 'An error occurred while checking your bio. Please try again.', ephemeral: true });
  }
}
