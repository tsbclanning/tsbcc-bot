import type { ButtonInteraction } from 'discord.js';
import { Ticket } from '../../database/models/Ticket.js';
import { logger } from '../../utils/logger.js';

export async function handleCloseTicketButton(interaction: ButtonInteraction): Promise<void> {
  const ticket = await Ticket.findOne({ channelId: interaction.channelId, status: 'OPEN' });
  if (!ticket) {
    await interaction.reply({ content: 'This is not an active ticket.', ephemeral: true });
    return;
  }

  ticket.status = 'CLOSED';
  await ticket.save();

  await interaction.reply({ content: 'Ticket closed. This channel will be deleted in 5 seconds.', ephemeral: false });

  setTimeout(async () => {
    try {
      await interaction.channel?.delete();
    } catch {
      logger.warn(`Failed to delete ticket channel ${interaction.channelId}`);
    }
  }, 5000);
}
