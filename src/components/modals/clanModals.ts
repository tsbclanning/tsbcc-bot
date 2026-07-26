import { ModalSubmitInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } from 'discord.js';
import { Clan } from '../../database/models/Clan.js';
import { config } from '../../config/index.js';
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

  // Send approval request to mod-logs
  const oldName = clan.name;
  const approveBtn = new ButtonBuilder().setCustomId(`approve_rename:${clan.clanId}`).setLabel('Approve').setStyle(ButtonStyle.Success);
  const denyBtn = new ButtonBuilder().setCustomId(`deny_rename:${clan.clanId}`).setLabel('Deny').setStyle(ButtonStyle.Danger);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(approveBtn, denyBtn);

  const embed = new EmbedBuilder()
    .setTitle('Rename Request — Needs Approval')
    .addFields(
      { name: 'Clan', value: oldName, inline: true },
      { name: 'New Name', value: newName, inline: true },
      { name: 'Requested by', value: `<@${interaction.user.id}>`, inline: true },
      { name: 'Server ID', value: clan.serverId, inline: true },
    )
    .setColor(0xfee75c)
    .setTimestamp();

  const modLogsChannel = await interaction.client.channels.fetch(config.community.channels.modLogs).catch(() => null);
  if (modLogsChannel?.isTextBased()) {
    await (modLogsChannel as any).send({ embeds: [embed], components: [row] });
  }

  await interaction.reply({ content: 'Rename request sent to staff for approval. Trolling rename requests will result in a strike.', ephemeral: true });
}

export async function handleSwitchOwnerModal(interaction: ModalSubmitInteraction): Promise<void> {
  const newOwnerId = interaction.fields.getTextInputValue('input_new_owner_id');
  const clan = await Clan.findOne({ ownerId: interaction.user.id });
  if (!clan) {
    await interaction.reply({ content: 'You do not own a clan.', ephemeral: true });
    return;
  }

  // Send approval request to mod-logs
  const approveBtn = new ButtonBuilder().setCustomId(`approve_owner:${clan.clanId}`).setLabel('Approve').setStyle(ButtonStyle.Success);
  const denyBtn = new ButtonBuilder().setCustomId(`deny_owner:${clan.clanId}`).setLabel('Deny').setStyle(ButtonStyle.Danger);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(approveBtn, denyBtn);

  const embed = new EmbedBuilder()
    .setTitle('Owner Transfer Request — Needs Approval')
    .addFields(
      { name: 'Clan', value: clan.name, inline: true },
      { name: 'Current Owner', value: `<@${interaction.user.id}>`, inline: true },
      { name: 'New Owner', value: `<@${newOwnerId}>`, inline: true },
      { name: 'Server ID', value: clan.serverId, inline: true },
    )
    .setColor(0xfee75c)
    .setTimestamp();

  const modLogsChannel = await interaction.client.channels.fetch(config.community.channels.modLogs).catch(() => null);
  if (modLogsChannel?.isTextBased()) {
    await (modLogsChannel as any).send({ embeds: [embed], components: [row] });
  }

  await interaction.reply({ content: 'Owner transfer request sent to staff for approval.', ephemeral: true });
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

  // Send approval request to mod-logs
  const approveBtn = new ButtonBuilder().setCustomId(`approve_merge:${clan.clanId}|${targetClan.clanId}`).setLabel('Approve').setStyle(ButtonStyle.Success);
  const denyBtn = new ButtonBuilder().setCustomId(`deny_merge:${clan.clanId}`).setLabel('Deny').setStyle(ButtonStyle.Danger);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(approveBtn, denyBtn);

  const embed = new EmbedBuilder()
    .setTitle('Clan Merge Request — Needs Approval')
    .addFields(
      { name: 'Source Clan', value: clan.name, inline: true },
      { name: 'Target Clan', value: targetClan.name, inline: true },
      { name: 'Requested by', value: `<@${interaction.user.id}>`, inline: true },
    )
    .setColor(0xfee75c)
    .setTimestamp();

  const modLogsChannel = await interaction.client.channels.fetch(config.community.channels.modLogs).catch(() => null);
  if (modLogsChannel?.isTextBased()) {
    await (modLogsChannel as any).send({ embeds: [embed], components: [row] });
  }

  await interaction.reply({ content: 'Merge request sent to staff for approval.', ephemeral: true });
}
