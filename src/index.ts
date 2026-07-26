import { createClient } from './bot.js';
import { connectDatabase } from './database/connect.js';
import { registerEvents } from './events/index.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';

async function main(): Promise<void> {
  if (!config.token) {
    logger.error('DISCORD_TOKEN is not set.');
    process.exit(1);
  }

  await connectDatabase(config.mongodbUri);

  const client = createClient();

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
  });

  registerEvents(client);
  await client.login(config.token);

  logger.info('Bot is fully operational.');
}

main().catch((error) => {
  logger.error('Fatal error during startup:', error);
  process.exit(1);
});
