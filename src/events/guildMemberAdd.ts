import type { GuildMember, Client } from 'discord.js';
import { config } from '../config/index.js';
import { buildWelcomeEmbed } from '../utils/embeds.js';
import { logger } from '../utils/logger.js';

export async function execute(member: GuildMember): Promise<void> {
  // Only send welcome in the community server
  if (member.guild.id !== config.community.guildId) return;

  try {
    const [embed, row] = buildWelcomeEmbed();
    await member.send({ embeds: [embed], components: [row] });
    logger.info(`Welcome message sent to ${member.user.tag} (${member.id})`);
  } catch {
    // DM might be closed — try sending in verify channel
    try {
      const channel = member.guild.channels.cache.get(config.community.channels.verification);
      if (channel?.isTextBased()) {
        const [embed, row] = buildWelcomeEmbed();
        await (channel as any).send({ content: `Welcome <@${member.id}>!`, embeds: [embed], components: [row] });
      }
    } catch { /* both failed */ }
  }
}
