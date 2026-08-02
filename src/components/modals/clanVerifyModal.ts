import type { ModalSubmitInteraction } from 'discord.js';
import { Verification } from '../../database/models/Verification.js';
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

  for (const region of regionList) {
    const verification = await Verification.create({
      verificationId: `ver-${Date.now()}-${region}`,
      clanName,
      ownerId: interaction.user.id,
      serverId,
      region,
      code: '',
      status: 'PENDING',
    });
  }

  // Clean up stored regions
  delete (globalThis as any).verifyRegions[interaction.user.id];

  await interaction.reply({
    content: `**Verification started for ${clanName}**\nRegions: ${regions}\n\n**Next step:** Invite the bot to your clan server now using this link:\nhttps://discord.com/api/oauth2/authorize?client_id=${interaction.client.user?.id}&permissions=8&scope=bot%20applications.commands\n\nThe bot will join, check your member count (minimum 100 real members per region, no botting), and then leave automatically. If your clan meets the requirements, it will be verified and you'll receive a mainer code via DM.\n\nIf denied, the reason will be posted in the denial channel.`,
    ephemeral: true,
  });

  logger.info(`Clan verification started: ${clanName} for regions ${regions} by ${interaction.user.id}`);
}
