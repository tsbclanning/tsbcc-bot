import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once('ready', async () => {
  console.log(`\nLogged in as ${client.user?.tag}\n`);
  console.log('=== SERVERS THE BOT IS IN ===\n');

  for (const guild of client.guilds.cache.values()) {
    console.log(`\n--- SERVER: ${guild.name} ---`);
    console.log(`Server ID: ${guild.id}`);
    console.log(`Member count: ${guild.memberCount}`);

    console.log(`\n--- ROLES ---`);
    const roles = guild.roles.cache.sort((a, b) => b.position - a.position);
    for (const role of roles.values()) {
      if (role.name === '@everyone') continue;
      console.log(`${role.name} = ${role.id}`);
    }

    console.log(`\n--- CHANNELS ---`);
    const channels = guild.channels.cache.sort((a, b) => ((a as any).position ?? 0) - ((b as any).position ?? 0));
    for (const channel of channels.values()) {
      const type = channel.type === 0 ? 'TEXT' : channel.type === 4 ? 'CATEGORY' : channel.type === 2 ? 'VOICE' : 'OTHER';
      console.log(`[${type}] ${channel.name} = ${channel.id}`);
    }
    console.log(`\n${'='.repeat(60)}\n`);
  }

  console.log('\nDone! Copy these into your .env\n');
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
