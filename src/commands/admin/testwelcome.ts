import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { buildWelcomeEmbed } from '../../utils/embeds.js';

export const testwelcomeCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('testwelcome')
    .setDescription('Test the welcome message by sending it to a user')
    .addUserOption((opt) => opt.setName('user').setDescription('User to send the test welcome to').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user')!;
    const [embed, row] = buildWelcomeEmbed();

    try {
      await targetUser.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: `✅ Welcome message sent to <@${targetUser.id}> via DM.`, ephemeral: true });
    } catch {
      // DM closed — send in channel
      await interaction.reply({ content: `Couldn't DM <@${targetUser.id}>, sending here instead:`, embeds: [embed], components: [row], ephemeral: false });
    }
  },
};
