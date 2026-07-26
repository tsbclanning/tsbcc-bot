import type { ModalSubmitInteraction } from 'discord.js';
import { Clan } from '../../database/models/Clan.js';
import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { isAdmin } from '../../utils/permissions.js';
import { logger } from '../../utils/logger.js';

export async function handleRenameClanModal(interaction: ModalSubmitInteraction): Promise<void> {
  const newName = interaction.fields.getTextInputValue('input_clan_name');
  const clan = await Clan.findOne({ ownerId: interaction.user.id });
  if (!clan) {
    await interaction.reply({ content: 'You do not own a clan.', ephemeral: true });
    return;
  }

  // If admin, apply directly
  if (isAdmin(interaction.member as any)) {
    clan.name = newName;
    await clan.save();
    await interaction.reply({ content: `Clan renamed to **${newName}**.`, ephemeral: true });
    return;
  }

  // Send approval request
  const oldName = clan.name;
  const approveBtn = new ButtonBuilder().setCustomId(`approve_rename:${clan.clanId}`).setLabel('Approve').setStyle(ButtonStyle.Success);
  const denyBtn = new ButtonBuilder().setCustomId(`deny_rename:${clan.clanId}`).setLabel('Deny').setStyle(ButtonStyle.Danger);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(approveBtn, denyBtn);

  const channel = interaction.channel;
  if (channel?.isTextBased()) {
    await (channel as any).send({
      content: `**Rename Request**\n**${oldName}** → **${newName}**\nRequested by: <@${interaction.user.id}>\nServer ID: ${clan.serverId}`,
      components: [row],
    });
  }

  await interaction.reply({ content: 'Rename request sent for admin approval. Trolling rename requests will result in a strike.', ephemeral: true });
}

export async function handleSwitchOwnerModal(interaction: ModalSubmitInteraction): Promise<void> {
  const newOwnerId = interaction.fields.getTextInputValue('input_new_owner_id');
  const clan = await Clan.findOne({ ownerId: interaction.user.id });
  if (!clan) {
    await interaction.reply({ content: 'You do not own a clan.', ephemeral: true });
    return;
  }

  // Send approval request
  const approveBtn = new ButtonBuilder().setCustomId(`approve_owner:${clan.clanId}`).setLabel('Approve').setStyle(ButtonStyle.Success);
  const denyBtn = new ButtonBuilder().setCustomId(`deny_owner:${clan.clanId}`).setLabel('Deny').setStyle(ButtonStyle.Danger);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(approveBtn, denyBtn);

  const channel = interaction.channel;
  if (channel?.isTextBased()) {
    await (channel as any).send({
      content: `**Owner Transfer Request**\nClan: ${clan.name}\nNew owner: <@${newOwnerId}>\nRequested by: <@${interaction.user.id}>`,
      components: [row],
    });
  }

  await interaction.reply({ content: 'Owner transfer request sent for admin approval.', ephemeral: true });
}

export async function handleMergeClanModal(interaction: ModalSubmitInteraction): Promise<void> {
  const targetServerId = interaction.fields.getTextInputValue('input_merge_target_id');
  const clan = await Clan.findOne({ ownerId: interaction.user.id });
  if (!clan) {
    await interaction.reply({ content: 'You do not own a clan.', ephemeral: true });
    return;
  }

  const targetClan = await Clan.findOne({ serverId: targetServerId });
  if (!targetClan) {
    await interaction.reply({ content: 'Target clan not found.', ephemeral: true });
    return;
  }

  // Merge: transfer all regions from source to target
  for (const r of clan.regions) {
    const existing = targetClan.regions.find((tr) => tr.region === r.region);
    if (!existing) {
      targetClan.regions.push(r);
    }
  }
  await targetClan.save();
  clan.status = 'DISBANDED';
  await clan.save();

  await interaction.reply({ content: `**${clan.name}** has been merged into **${targetClan.name}**. Use \`/refresh\` to update leaderboards.`, ephemeral: true });
  logger.info(`Clan merge: ${clan.name} merged into ${targetClan.name}`);
}
