import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Warning } from '../../database/models/Warning.js';

export const checkwarnsCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('checkwarns')
    .setDescription('View all active warnings against a clan')
    .addStringOption((opt) => opt.setName('clan_name').setDescription('Clan name').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    const clanName = interaction.options.getString('clan_name')!;
    const { Clan } = await import('../../database/models/Clan.js');
    const clan = await Clan.findOne({ name: { $regex: new RegExp(clanName, 'i') } });
    if (!clan) {
      await interaction.reply({ content: 'Clan not found.', ephemeral: true });
      return;
    }
    const warnings = await Warning.find({ clanId: clan.clanId, active: true });
    if (warnings.length === 0) {
      await interaction.reply({ content: `**${clan.name}** has no active warnings.`, ephemeral: true });
      return;
    }
    const list = warnings.map((w, i) => `${i + 1}. [${w.type}] ${w.reason} — by <@${w.issuedBy}>`).join('\n');
    await interaction.reply({ content: `**${clan.name}** — Active Warnings:\n${list}`, ephemeral: true });
  },
};
