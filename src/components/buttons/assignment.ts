import type { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Clan } from '../../database/models/Clan.js';
import { Ticket } from '../../database/models/Ticket.js';
import { config } from '../../config/index.js';
import { buildClanUpdateNewsEmbed } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';

export async function handleAcceptAssignment(interaction: ButtonInteraction): Promise<void> {
  const ticket = await Ticket.findOne({ channelId: interaction.channelId, status: 'OPEN' });
  if (!ticket) {
    await interaction.reply({ content: 'No active assignment ticket found.', ephemeral: true });
    return;
  }

  if (interaction.user.id !== ticket.assigneeId) {
    await interaction.reply({ content: 'This assignment is not for you.', ephemeral: true });
    return;
  }

  const clan = await Clan.findOne({ clanId: ticket.clanId });
  if (!clan) {
    await interaction.reply({ content: 'Clan not found.', ephemeral: true });
    return;
  }

  const regionData = clan.regions.find((r) => r.region === ticket.targetRegion);
  if (!regionData) {
    await interaction.reply({ content: 'Region not found for this clan.', ephemeral: true });
    return;
  }

  // Assign role
  if (ticket.type === 'WM_ASSIGN') {
    regionData.warManager = interaction.user.id;
  } else if (ticket.type === 'RL_ASSIGN') {
    regionData.regionLead = interaction.user.id;
  }

  await clan.save();

  // Post to clanning news
  const newsChannel = await interaction.client.channels.fetch(config.community.channels.clanningNews).catch(() => null);
  if (newsChannel?.isTextBased()) {
    const role = ticket.type === 'WM_ASSIGN' ? 'war manager' : 'region lead';
    const embed = buildClanUpdateNewsEmbed(ticket.targetRegion!, regionData.rank, interaction.user.id, `has been assigned ${role} in ${ticket.targetRegion}`, clan.name, clan.serverId);
    await (newsChannel as any).send({ embeds: [embed] });
  }

  ticket.status = 'CLOSED';
  await ticket.save();

  await interaction.reply({ content: `✅ You have been assigned as **${ticket.type === 'WM_ASSIGN' ? 'War Manager' : 'Region Lead'}** for **${clan.name}** in ${ticket.targetRegion}.`, ephemeral: false });

  setTimeout(async () => {
    try { await interaction.channel?.delete(); } catch { /* channel already deleted */ }
  }, 3000);
}

export async function handleDenyAssignment(interaction: ButtonInteraction): Promise<void> {
  const ticket = await Ticket.findOne({ channelId: interaction.channelId, status: 'OPEN' });
  if (!ticket) {
    await interaction.reply({ content: 'No active assignment ticket found.', ephemeral: true });
    return;
  }

  if (interaction.user.id !== ticket.assigneeId) {
    await interaction.reply({ content: 'This assignment is not for you.', ephemeral: true });
    return;
  }

  ticket.status = 'CLOSED';
  await ticket.save();

  await interaction.reply({ content: '❌ Assignment denied.', ephemeral: false });

  setTimeout(async () => {
    try { await interaction.channel?.delete(); } catch { /* channel already deleted */ }
  }, 3000);
}
