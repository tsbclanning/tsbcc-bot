import type { ModalSubmitInteraction } from 'discord.js';
import { Verification } from '../../database/models/Verification.js';
import { generateMainerCode } from '../../utils/helpers.js';
import { logger } from '../../utils/logger.js';

export async function handleClanVerifyModal(interaction: ModalSubmitInteraction): Promise<void> {
  const clanName = interaction.fields.getTextInputValue('input_verify_clan_name');
  const serverId = interaction.fields.getTextInputValue('input_verify_server_id');

  // Get stored regions
  const regions = ((globalThis as any).verifyRegions || {})[interaction.user.id] || '';
  if (!regions) {
    await interaction.reply({ content: 'Could not find your selected regions. Please try again.', ephemeral: true });
    return;
  }

  const regionList = regions.split(', ');
  const code = generateMainerCode();

  for (const region of regionList) {
    const verification = await Verification.create({
      verificationId: `ver-${Date.now()}-${region}`,
      clanName,
      ownerId: interaction.user.id,
      serverId,
      region,
      code,
      status: 'PENDING',
    });
  }

  // Clean up stored regions
  delete (globalThis as any).verifyRegions[interaction.user.id];

  await interaction.reply({
    content: `**Verification started for ${clanName}**\nRegions: ${regions}\n\nYour verification code is: **${code}**\n\nPlease put this code in your clan server's topic/description and invite the bot. The bot will join, check your member count (minimum 100 per region), and then leave. If your clan meets the requirements, it will be automatically verified.`,
    ephemeral: true,
  });

  logger.info(`Clan verification started: ${clanName} for regions ${regions} by ${interaction.user.id}`);
}
