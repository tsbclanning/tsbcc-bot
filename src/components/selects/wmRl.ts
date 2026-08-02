import type { StringSelectMenuInteraction } from 'discord.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Clan } from '../../database/models/Clan.js';
import { Ticket } from '../../database/models/Ticket.js';
import { config } from '../../config/index.js';
import { generateTicketId } from '../../utils/helpers.js';
import { ButtonCustomId } from '../../types/index.js';
import { logger } from '../../utils/logger.js';

export async function handleAssignRegionSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  const value = interaction.values[0];
  const [clanId, region, type] = value.split('|');

  // Show modal for Discord User ID
  const modal = new ModalBuilder()
    .setCustomId(`assign_user:${clanId}|${region}|${type}`)
    .setTitle(`Assign ${type}`);

  const input = new TextInputBuilder()
    .setCustomId('assign_user_id')
    .setLabel(`Discord User ID to assign as ${type}`)
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
  await interaction.showModal(modal);
}

export async function handleAssignClanSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  // This is used for the second step if needed
  await interaction.reply({ content: 'Assignment flow continued.', ephemeral: true });
}

export async function handleRemoveAssignmentSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  const value = interaction.values[0];
  const [clanId, region, type, who] = value.split('|');

  const clan = await Clan.findOne({ clanId });
  if (!clan) {
    await interaction.reply({ content: 'Clan not found.', ephemeral: true });
    return;
  }

  const regionData = clan.regions.find((r) => r.region === region);
  if (!regionData) {
    await interaction.reply({ content: 'Region not found.', ephemeral: true });
    return;
  }

  let removedUserId: string | null = null;
  if (type === 'WM') {
    removedUserId = regionData.warManager;
    regionData.warManager = null;
  } else if (type === 'RL') {
    removedUserId = regionData.regionLead;
    regionData.regionLead = null;
  }

  await clan.save();

  // Post to clanning news
  const newsChannel = await interaction.client.channels.fetch(config.community.channels.clanningNews).catch(() => null);
  if (newsChannel?.isTextBased() && removedUserId) {
    const role = type === 'WM' ? 'war manager' : 'region lead';
    const action = who === 'self' ? 'has resigned as' : 'has been removed as';
    const { buildClanUpdateNewsEmbed } = await import('../../utils/embeds.js');
    const embed = buildClanUpdateNewsEmbed(region, regionData.rank, removedUserId, `${action} ${role} in ${region}`, clan.name, clan.serverId);
    await (newsChannel as any).send({ embeds: [embed] });
  }

  await interaction.reply({ content: `✅ ${type === 'WM' ? 'War Manager' : 'Region Lead'} removed for **${clan.name}** in ${region}.`, ephemeral: true });
  logger.info(`Assignment removed: ${type} for ${clan.name} in ${region}`);
}

// Helper to create assignment ticket
export async function createAssignmentTicket(
  client: any,
  guildId: string,
  clanId: string,
  region: string,
  type: string,
  assigneeId: string,
  ownerId: string,
): Promise<void> {
  const clan = await Clan.findOne({ clanId });
  if (!clan) return;

  const guild = await client.guilds.fetch(guildId);
  if (!guild) return;

  const ticketChannel = await guild.channels.create({
    name: `assign-${type.toLowerCase()}-${clan.name.toLowerCase()}-${region.toLowerCase()}`,
    type: ChannelType.GuildText,
    parent: config.war.ticketCategoryId || undefined,
    permissionOverwrites: [
      { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      { id: assigneeId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      { id: ownerId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    ],
  });

  if (config.war.roles.tsbccAdmin) {
    await ticketChannel.permissionOverwrites.edit(config.war.roles.tsbccAdmin, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
  }

  const ticket = await Ticket.create({
    ticketId: generateTicketId(),
    channelId: ticketChannel.id,
    type: type === 'WM' ? 'WM_ASSIGN' : 'RL_ASSIGN',
    status: 'OPEN',
    clanId,
    targetRegion: region,
    assigneeId,
  });

  const embed = new EmbedBuilder()
    .setTitle('Assignment Request')
    .setDescription(
      `**${clan.name}** is requesting you to become their **${type === 'WM' ? 'War Manager' : 'Region Lead'}** in **${region}**.\n\n` +
      `Do you accept?`
    )
    .setColor(0xfee75c);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(ButtonCustomId.ACCEPT_ASSIGNMENT).setLabel('Accept').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(ButtonCustomId.DENY_ASSIGNMENT).setLabel('Deny').setStyle(ButtonStyle.Danger),
  );

  await ticketChannel.send({ content: `<@${assigneeId}>`, embeds: [embed], components: [row] });
}
