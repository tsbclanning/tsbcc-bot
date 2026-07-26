import type { StringSelectMenuInteraction } from 'discord.js';
import { ChannelType, PermissionFlagsBits, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Clan } from '../../database/models/Clan.js';
import { Ticket } from '../../database/models/Ticket.js';
import { config } from '../../config/index.js';
import { generateTicketId, clanNameToSlug } from '../../utils/helpers.js';
import { logger } from '../../utils/logger.js';

export async function handleChallengeFromSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  const value = interaction.values[0];
  const [clanId, region, rankStr, role] = value.split('|');
  const rank = parseInt(rankStr, 10);

  const clan = await Clan.findOne({ clanId });
  if (!clan) {
    await interaction.reply({ content: 'Clan not found.', ephemeral: true });
    return;
  }

  // Show target clan dropdown
  const allClans = await Clan.find({ status: 'ACTIVE' });
  const regionClans = allClans
    .map((c) => ({ clan: c, rank: c.regions.find((r) => r.region === region)?.rank }))
    .filter((c): c is { clan: typeof c.clan; rank: number } => c.rank !== undefined)
    .filter((c) => c.rank < rank && c.rank >= rank - 10)
    .sort((a, b) => a.rank - b.rank);

  if (regionClans.length === 0) {
    await interaction.update({ content: 'No clans available to challenge within your range.', components: [] });
    return;
  }

  const select = new StringSelectMenuBuilder()
    .setCustomId('select_challenge_target')
    .setPlaceholder('Select a clan to challenge...')
    .addOptions(regionClans.map((c) => ({
      label: `${c.clan.name} (#${c.rank})`,
      value: `${clanId}|${region}|${rank}|${c.clan.clanId}|${c.rank}`,
    })));

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
  await interaction.update({
    content: `Challenging as **${role}** of **${clan.name}** (Top ${rank}, ${region}). Select a clan to challenge:`,
    components: [row],
  });
}

export async function handleChallengeTargetSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  const value = interaction.values[0];
  const [challengerClanId, region, challengerRankStr, defenderClanId, defenderRankStr] = value.split('|');
  const challengerRank = parseInt(challengerRankStr, 10);
  const defenderRank = parseInt(defenderRankStr, 10);

  const challengerClan = await Clan.findOne({ clanId: challengerClanId });
  const defenderClan = await Clan.findOne({ clanId: defenderClanId });

  if (!challengerClan || !defenderClan) {
    await interaction.reply({ content: 'One or both clans not found.', ephemeral: true });
    return;
  }

  // Create ticket channel
  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({ content: 'Could not create ticket.', ephemeral: true });
    return;
  }

  const challengerSlug = clanNameToSlug(challengerClan.name);
  const defenderSlug = clanNameToSlug(defenderClan.name);
  const channelName = `${challengerSlug}-top${challengerRank}-${region.toLowerCase()}-vs-${defenderSlug}-top${defenderRank}`;

  const ticketChannel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: config.war.ticketCategoryId || undefined,
    permissionOverwrites: [
      { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      { id: challengerClan.ownerId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      { id: defenderClan.ownerId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    ],
  });

  // Add WM and RL permissions
  const challengerRegion = challengerClan.regions.find((r) => r.region === region);
  const defenderRegion = defenderClan.regions.find((r) => r.region === region);

  if (challengerRegion?.warManager) {
    await ticketChannel.permissionOverwrites.edit(challengerRegion.warManager, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
  }
  if (challengerRegion?.regionLead) {
    await ticketChannel.permissionOverwrites.edit(challengerRegion.regionLead, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
  }
  if (defenderRegion?.warManager) {
    await ticketChannel.permissionOverwrites.edit(defenderRegion.warManager, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
  }
  if (defenderRegion?.regionLead) {
    await ticketChannel.permissionOverwrites.edit(defenderRegion.regionLead, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
  }

  // Add TSBCC Admin and War Manager Observer roles
  if (config.war.roles.tsbccAdmin) {
    await ticketChannel.permissionOverwrites.edit(config.war.roles.tsbccAdmin, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
  }
  if (config.war.roles.warManagerObserver) {
    await ticketChannel.permissionOverwrites.edit(config.war.roles.warManagerObserver, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
  }

  // Create ticket record
  const ticket = await Ticket.create({
    ticketId: generateTicketId(),
    channelId: ticketChannel.id,
    type: 'CHALLENGE',
    status: 'OPEN',
    challengerClanId,
    defenderClanId,
    region,
    challengerRank,
    defenderRank,
  });

  // Send initial message in ticket
  const embed = new EmbedBuilder()
    .setTitle('Challenge Ticket')
    .setDescription(
      `**${challengerClan.name}** (#${challengerRank}) vs **${defenderClan.name}** (#${defenderRank})\n` +
      `Region: ${region}\n\n` +
      `Coordinate your match here. Once the match is complete, use \`/scorematch\` to submit the result.\n\n` +
      `Use the button below to close this ticket when done.`
    )
    .setColor(0x5865f2);

  const closeBtn = new ButtonBuilder()
    .setCustomId('btn_close_ticket')
    .setLabel('Close Ticket')
    .setStyle(ButtonStyle.Danger);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(closeBtn);

  await ticketChannel.send({
    content: `<@${challengerClan.ownerId}> <@${defenderClan.ownerId}> <@&${config.war.roles.tsbccAdmin}>`,
    embeds: [embed],
    components: [row],
  });

  await interaction.update({ content: `Challenge ticket created: ${ticketChannel}`, components: [] });
  logger.info(`Challenge ticket created: ${challengerClan.name} vs ${defenderClan.name} in ${region}`);
}
