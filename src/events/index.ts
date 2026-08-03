import type { Client } from 'discord.js';
import { Events } from 'discord.js';
import { logger } from '../utils/logger.js';
import { execute as readyExecute } from './ready.js';
import { execute as interactionExecute } from './interactionCreate.js';
import { execute as guildCreateExecute } from './guildCreate.js';
import { execute as guildMemberAddExecute } from './guildMemberAdd.js';

export function registerEvents(client: Client): void {
  client.once(Events.ClientReady, (...args) => readyExecute(...args));

  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      await interactionExecute(interaction);
    } catch (error) {
      logger.error('FATAL interaction error:', error);
      try {
        if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'An error occurred. Please try again.', ephemeral: true });
        }
      } catch {
        // Interaction expired
      }
    }
  });

  client.on(Events.GuildCreate, async (guild) => {
    try {
      await guildCreateExecute(guild, client);
    } catch (error) {
      logger.error('GuildCreate error:', error);
    }
  });

  client.on(Events.GuildMemberAdd, async (member) => {
    try {
      await guildMemberAddExecute(member);
    } catch (error) {
      logger.error('GuildMemberAdd error:', error);
    }
  });

  logger.info('Event handlers registered');
}
