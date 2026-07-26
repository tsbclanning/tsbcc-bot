import { ButtonInteraction, TextChannel, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { Ticket } from '../../database/models/Ticket.js';
import { Clan } from '../../database/models/Clan.js';
import { config } from '../../config/index.js';
import { canCloseTicket } from '../../utils/permissions.js';
import { logger } from '../../utils/logger.js';
import { clanNameToSlug } from '../../utils/helpers.js';

export async function handleCloseTicketButton(interaction: ButtonInteraction): Promise<void> {
  const ticket = await Ticket.findOne({ channelId: interaction.channelId, status: 'OPEN' });
  if (!ticket) {
    await interaction.reply({ content: 'This is not an active ticket.', ephemeral: true });
    return;
  }

  if (!canCloseTicket(interaction.member as any)) {
    await interaction.reply({ content: 'You do not have permission to close this ticket.', ephemeral: true });
    return;
  }

  const channel = interaction.channel as TextChannel;
  if (!channel) return;

  // Fetch all messages in the ticket
  const messages = await channel.messages.fetch({ limit: 100 });
  const sortedMessages = Array.from(messages.values()).reverse();

  // Build transcript text
  let transcript = '';
  for (const msg of sortedMessages) {
    const timestamp = msg.createdAt.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const author = msg.author.username;
    const content = msg.content || '[embed/attachment]';
    transcript += `[${timestamp}] ${author}: ${content}\n`;
  }

  // Get clan names for the fight title
  const challengerClan = ticket.challengerClanId ? await Clan.findOne({ clanId: ticket.challengerClanId }) : null;
  const defenderClan = ticket.defenderClanId ? await Clan.findOne({ clanId: ticket.defenderClanId }) : null;

  let fightName = 'ticket';
  if (challengerClan && defenderClan && ticket.region) {
    const cSlug = clanNameToSlug(challengerClan.name);
    const dSlug = clanNameToSlug(defenderClan.name);
    fightName = `${cSlug}-top${ticket.challengerRank}-${ticket.region.toLowerCase()}-vs-${dSlug}-top${ticket.defenderRank}`;
  }

  // Create transcript file
  const buffer = Buffer.from(transcript, 'utf-8');
  const attachment = new AttachmentBuilder(buffer, { name: `${fightName}.txt` });

  // Send transcript to transcript channel in war management server
  const transcriptChannelId = config.war.channels.transcript || config.war.channels.guide;
  const transcriptChannel = await interaction.client.channels.fetch(transcriptChannelId).catch(() => null);

  if (transcriptChannel?.isTextBased()) {
    const embed = new EmbedBuilder()
      .setTitle(`Ticket Transcript — ${fightName}`)
      .setDescription(
        `**Closed by:** <@${interaction.user.id}>\n` +
        `**Challenger:** ${challengerClan?.name ?? 'Unknown'} (#${ticket.challengerRank ?? '?'})\n` +
        `**Defender:** ${defenderClan?.name ?? 'Unknown'} (#${ticket.defenderRank ?? '?'})\n` +
        `**Region:** ${ticket.region ?? 'N/A'}`
      )
      .setColor(0x5865f2)
      .setTimestamp();

    await (transcriptChannel as any).send({
      content: `**Ticket closed by <@${interaction.user.id}>** — \`${fightName}\``,
      embeds: [embed],
      files: [attachment],
    });
  }

  ticket.status = 'CLOSED';
  await ticket.save();

  await interaction.reply({ content: `Ticket closed by <@${interaction.user.id}>. Transcript saved. This channel will be deleted in 5 seconds.`, ephemeral: false });

  setTimeout(async () => {
    try {
      await interaction.channel?.delete();
    } catch {
      logger.warn(`Failed to delete ticket channel ${interaction.channelId}`);
    }
  }, 5000);
}
