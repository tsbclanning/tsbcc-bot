import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Clan } from '../../database/models/Clan.js';
import { config } from '../../config/index.js';
import { Region } from '../../types/index.js';

export const brutalCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('brutal')
    .setDescription('Insert a clan at a specific competitive rank')
    .addStringOption((opt) => opt.setName('clan_name').setDescription('Clan name').setRequired(true))
    .addStringOption((opt) => opt.setName('region').setDescription('Region').setRequired(true).addChoices(
      { name: 'EU', value: Region.EU }, { name: 'AS', value: Region.AS }, { name: 'NA', value: Region.NA }, { name: 'SA', value: Region.SA }, { name: 'OCE', value: Region.OCE },
    ))
    .addIntegerOption((opt) => opt.setName('rank').setDescription('Rank position to insert at').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    if (!(interaction.member as any)?.roles?.cache?.has(config.community.roles.admin)) {
      await interaction.reply({ content: 'Brutal role only.', ephemeral: true });
      return;
    }
    const clanName = interaction.options.getString('clan_name')!;
    const region = interaction.options.getString('region')!;
    const rank = interaction.options.getInteger('rank')!;
    const clan = await Clan.findOne({ name: { $regex: new RegExp(clanName, 'i') } });

    if (!clan) {
      await interaction.reply({ content: 'Clan not found.', ephemeral: true });
      return;
    }

    // Shift all clans at or below this rank down by 1
    const clans = await Clan.find({ 'regions.region': region, status: 'ACTIVE' });
    for (const c of clans) {
      const r = c.regions.find((rr) => rr.region === region);
      if (r && r.rank >= rank) {
        r.rank += 1;
        await c.save();
      }
    }

    // Add or update the region entry
    const existing = clan.regions.find((r) => r.region === region);
    if (existing) {
      existing.rank = rank;
    } else {
      clan.regions.push({ region, rank, warManager: null, regionLead: null });
    }
    await clan.save();

    await interaction.reply({ content: `**${clan.name}** inserted at rank #${rank} in ${region}.`, ephemeral: true });
  },
};
