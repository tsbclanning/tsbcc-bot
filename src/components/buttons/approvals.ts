import type { ButtonInteraction } from 'discord.js';
import { Clan } from '../../database/models/Clan.js';
import { config } from '../../config/index.js';
import { buildClanUpdateNewsEmbed } from '../../utils/embeds.js';
import { updateLeaderboard } from '../../services/leaderboard.js';
import { logger } from '../../utils/logger.js';

export async function handleApproveRename(interaction: ButtonInteraction): Promise<void> {
  const clanId = interaction.customId.split(':')[1];
  const clan = await Clan.findOne({ clanId });
  if (!clan) {
    await interaction.reply({ content: 'Clan not found.', ephemeral: true });
    return;
  }

  // Extract new name from the embed
  const embed = interaction.message.embeds[0];
  const desc = embed?.description ?? '';
  const match = desc.match(/\*\*(.+?)\*\* → \*\*(.+?)\*\*/);
  if (match) {
    clan.name = match[2];
    await clan.save();
    await interaction.update({ content: `✅ Rename approved by <@${interaction.user.id}>. Clan renamed to **${clan.name}**.`, embeds: [], components: [] });
    logger.info(`Clan renamed to ${clan.name} (approved by ${interaction.user.id})`);
  } else {
    await interaction.reply({ content: 'Could not parse rename data.', ephemeral: true });
  }
}

export async function handleDenyRename(interaction: ButtonInteraction): Promise<void> {
  await interaction.update({ content: `❌ Rename denied by <@${interaction.user.id}>.`, embeds: [], components: [] });
}

export async function handleApproveOwner(interaction: ButtonInteraction): Promise<void> {
  const clanId = interaction.customId.split(':')[1];
  const clan = await Clan.findOne({ clanId });
  if (!clan) {
    await interaction.reply({ content: 'Clan not found.', ephemeral: true });
    return;
  }

  // Extract new owner from embed
  const embed = interaction.message.embeds[0];
  const desc = embed?.description ?? '';
  const match = desc.match(/New owner.*<@!?(\d+)>/);
  if (match) {
    clan.ownerId = match[1];
    await clan.save();
    await interaction.update({ content: `✅ Owner transfer approved by <@${interaction.user.id}>.`, embeds: [], components: [] });
    logger.info(`Clan ${clan.name} owner transferred to ${clan.ownerId}`);
  } else {
    await interaction.reply({ content: 'Could not parse owner data.', ephemeral: true });
  }
}

export async function handleDenyOwner(interaction: ButtonInteraction): Promise<void> {
  await interaction.update({ content: `❌ Owner transfer denied by <@${interaction.user.id}>.`, embeds: [], components: [] });
}
