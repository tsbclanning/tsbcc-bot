import type { Client } from 'discord.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
import { commands } from '../commands/index.js';
import { initLeaderboards } from '../services/leaderboard.js';
import { setupClanManagementPanel } from '../services/clanManagement.js';
import { setupCreateClanPanel, setupWelcomePanel } from '../services/createClanPanel.js';
import { setupChallengePanel } from '../services/warManagement.js';
import { setupCwmPanel, setupCwm2Panel } from '../services/warManagement.js';
import { REST, Routes } from 'discord.js';

export async function execute(client: Client): Promise<void> {
  logger.info(`Logged in as ${client.user?.tag}`);
  (globalThis as any).client = client;

  // Register slash commands
  try {
    const rest = new REST({ version: '10' }).setToken(config.token);
    const commandData = commands.map((cmd) => cmd.data.toJSON());

    await rest.put(Routes.applicationCommands(client.user!.id), { body: [] });
    logger.info('Cleared global slash commands');

    if (config.community.guildId) {
      await rest.put(
        Routes.applicationGuildCommands(client.user!.id, config.community.guildId),
        { body: commandData },
      );
      logger.info(`Registered ${commandData.length} guild slash commands (Community)`);
    }

    if (config.war.guildId) {
      await rest.put(
        Routes.applicationGuildCommands(client.user!.id, config.war.guildId),
        { body: commandData },
      );
      logger.info(`Registered ${commandData.length} guild slash commands (War Management)`);
    }
  } catch (error) {
    logger.error('Failed to register slash commands:', error);
  }

  // Initialize leaderboards
  try {
    await initLeaderboards(client);
  } catch (error) {
    logger.error('Failed to init leaderboards:', error);
  }

  // Initialize clan management panel
  try {
    await setupClanManagementPanel(client);
    await setupCreateClanPanel(client);
    await setupWelcomePanel(client);
  } catch (error) {
    logger.error('Failed to init clan management panel:', error);
  }

  // Initialize CWM + challenge panels in war management server
  try {
    await setupCwmPanel(client);
    await setupCwm2Panel(client);
    await setupChallengePanel(client);
  } catch (error) {
    logger.error('Failed to init war management panels:', error);
  }

  logger.info('Bot is ready.');
}
