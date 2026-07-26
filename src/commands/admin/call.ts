import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Clan } from '../../database/models/Clan.js';
import { isCompetitiveSupervisor } from '../../utils/permissions.js';

export const callCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('call')
    .setDescription('Send a DM to all clan leaders simultaneously (Super Admin)')
    .addStringOption((opt) => opt.setName('message').setDescription('Message to send').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    if (!isCompetitiveSupervisor(interaction.member as any)) {
      await interaction.reply({ content: 'Super Admin only.', ephemeral: true });
      return;
    }
    const message = interaction.options.getString('message')!;
    const clans = await Clan.find({ status: 'ACTIVE' });
    let sent = 0;
    let failed = 0;

    await interaction.reply({ content: `Sending DM to ${clans.length} clan leaders...`, ephemeral: true });

    for (const clan of clans) {
      try {
        const owner = await interaction.client.users.fetch(clan.ownerId);
        await owner.send(`📢 **TSBCC Announcement**\n\n${message}`);
        sent++;
      } catch {
        failed++;
      }
    }

    await interaction.editReply({ content: `DM sent to ${sent} clan leaders (${failed} failed).` });
  },
};
