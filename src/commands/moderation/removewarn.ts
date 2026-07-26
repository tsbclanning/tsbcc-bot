import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Warning } from '../../database/models/Warning.js';
import { isAdmin } from '../../utils/permissions.js';

export const removewarnCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('removewarn')
    .setDescription('Remove a specific warning from a clan\'s record')
    .addStringOption((opt) => opt.setName('warning_id').setDescription('Warning ID to remove').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    if (!isAdmin(interaction.member as any)) {
      await interaction.reply({ content: 'Admin only.', ephemeral: true });
      return;
    }
    const warningId = interaction.options.getString('warning_id')!;
    const result = await Warning.findByIdAndUpdate(warningId, { active: false });
    if (!result) {
      await interaction.reply({ content: 'Warning not found.', ephemeral: true });
      return;
    }
    await interaction.reply({ content: 'Warning removed.', ephemeral: true });
  },
};
