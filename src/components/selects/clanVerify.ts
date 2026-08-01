import { StringSelectMenuInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { ModalCustomId, ModalInputCustomId } from '../../types/index.js';

export async function handleVerifyRegionSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  const regions = interaction.values.join(', ');

  const modal = new ModalBuilder()
    .setCustomId(ModalCustomId.CLAN_VERIFY)
    .setTitle('Step 2 of 2 - Clan Details');

  const clanNameInput = new TextInputBuilder()
    .setCustomId(ModalInputCustomId.VERIFY_CLAN_NAME)
    .setLabel('Clan name')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const serverIdInput = new TextInputBuilder()
    .setCustomId(ModalInputCustomId.VERIFY_SERVER_ID)
    .setLabel('Your clan Discord server ID')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(clanNameInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(serverIdInput),
  );

  // Store regions in the interaction's customId via the modal
  await interaction.showModal(modal);

  // We need to pass the regions somehow — store in a temp field
  // Since Discord modals don't support hidden fields, we'll use a customId with the regions encoded
  // Actually, let's just store it in the modal customId
  // But customId has length limits. Let's use a different approach — store in memory temporarily
  (globalThis as any).verifyRegions = (globalThis as any).verifyRegions || {};
  (globalThis as any).verifyRegions[interaction.user.id] = regions;

  await interaction.followUp({ content: `Regions selected: ${regions}. Please fill out the modal to continue.`, ephemeral: true }).catch(() => {});
}
