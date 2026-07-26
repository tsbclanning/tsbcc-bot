import type { ButtonInteraction } from 'discord.js';
import { Clan } from '../../database/models/Clan.js';
import { config } from '../../config/index.js';
import { buildClanUpdateNewsEmbed } from '../../utils/embeds.js';
import { updateLeaderboard } from '../../services/leaderboard.js';
import { isAdmin } from '../../utils/permissions.js';
import { logger } from '../../utils/logger.js';

export async function handleApproveRename(interaction: ButtonInteraction): Promise<void> {
  if (!isAdmin(interaction.member as any)) {
    await interaction.reply({ content: 'Admin only.', ephemeral: true });
    return;
  }

  const clanId = interaction.customId.split(':')[1];
  const clan = await Clan.findOne({ clanId });
  if (!clan) {
    await interaction.reply({ content: 'Clan not found.', ephemeral: true });
    return;
  }

  // Extract new name from embed fields
  const embed = interaction.message.embeds[0];
  const newNameField = embed?.fields?.find((f) => f.name === 'New Name');
  if (newNameField) {
    const oldName = clan.name;
    clan.name = newNameField.value;
    await clan.save();
    await interaction.update({ content: `✅ Rename approved by <@${interaction.user.id}>. **${oldName}** → **${clan.name}**.`, embeds: [], components: [] });
    logger.info(`Clan renamed to ${clan.name} (approved by ${interaction.user.id})`);
  } else {
    await interaction.reply({ content: 'Could not parse rename data.', ephemeral: true });
  }
}

export async function handleDenyRename(interaction: ButtonInteraction): Promise<void> {
  if (!isAdmin(interaction.member as any)) {
    await interaction.reply({ content: 'Admin only.', ephemeral: true });
    return;
  }
  await interaction.update({ content: `❌ Rename denied by <@${interaction.user.id}>.`, embeds: [], components: [] });
}

export async function handleApproveOwner(interaction: ButtonInteraction): Promise<void> {
  if (!isAdmin(interaction.member as any)) {
    await interaction.reply({ content: 'Admin only.', ephemeral: true });
    return;
  }

  const clanId = interaction.customId.split(':')[1];
  const clan = await Clan.findOne({ clanId });
  if (!clan) {
    await interaction.reply({ content: 'Clan not found.', ephemeral: true });
    return;
  }

  // Extract new owner from embed fields
  const embed = interaction.message.embeds[0];
  const newOwnerField = embed?.fields?.find((f) => f.name === 'New Owner');
  if (newOwnerField) {
    const match = newOwnerField.value.match(/<@!?(\d+)>/);
    if (match) {
      const oldOwnerId = clan.ownerId;
      clan.ownerId = match[1];
      await clan.save();

      // Post to clanning news
      const newsChannel = await interaction.client.channels.fetch(config.community.channels.clanningNews).catch(() => null);
      if (newsChannel?.isTextBased()) {
        for (const r of clan.regions) {
          const embed = buildClanUpdateNewsEmbed(r.region, r.rank, clan.ownerId, 'has been assigned as new clan owner', clan.name, clan.serverId);
          await (newsChannel as any).send({ embeds: [embed] });
        }
      }

      await interaction.update({ content: `✅ Owner transfer approved by <@${interaction.user.id}>.`, embeds: [], components: [] });
      logger.info(`Clan ${clan.name} owner transferred to ${clan.ownerId}`);
    }
  } else {
    await interaction.reply({ content: 'Could not parse owner data.', ephemeral: true });
  }
}

export async function handleDenyOwner(interaction: ButtonInteraction): Promise<void> {
  if (!isAdmin(interaction.member as any)) {
    await interaction.reply({ content: 'Admin only.', ephemeral: true });
    return;
  }
  await interaction.update({ content: `❌ Owner transfer denied by <@${interaction.user.id}>.`, embeds: [], components: [] });
}

export async function handleApproveMerge(interaction: ButtonInteraction): Promise<void> {
  if (!isAdmin(interaction.member as any)) {
    await interaction.reply({ content: 'Admin only.', ephemeral: true });
    return;
  }

  const parts = interaction.customId.split(':')[1].split('|');
  const sourceClanId = parts[0];
  const targetClanId = parts[1];

  const sourceClan = await Clan.findOne({ clanId: sourceClanId });
  const targetClan = await Clan.findOne({ clanId: targetClanId });

  if (!sourceClan || !targetClan) {
    await interaction.reply({ content: 'One or both clans not found.', ephemeral: true });
    return;
  }

  // Transfer all regions from source to target
  for (const r of sourceClan.regions) {
    const existing = targetClan.regions.find((tr) => tr.region === r.region);
    if (!existing) {
      targetClan.regions.push(r);
    }
  }
  await targetClan.save();
  sourceClan.status = 'DISBANDED';
  await sourceClan.save();

  // Refresh leaderboards for all regions
  for (const r of sourceClan.regions) {
    await updateLeaderboard(interaction.client, r.region);
  }

  await interaction.update({ content: `✅ Merge approved by <@${interaction.user.id}>. **${sourceClan.name}** merged into **${targetClan.name}**.`, embeds: [], components: [] });
  logger.info(`Clan merge approved: ${sourceClan.name} merged into ${targetClan.name}`);
}

export async function handleDenyMerge(interaction: ButtonInteraction): Promise<void> {
  if (!isAdmin(interaction.member as any)) {
    await interaction.reply({ content: 'Admin only.', ephemeral: true });
    return;
  }
  await interaction.update({ content: `❌ Merge denied by <@${interaction.user.id}>.`, embeds: [], components: [] });
}
