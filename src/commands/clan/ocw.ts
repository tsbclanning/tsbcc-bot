import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Clan } from '../../database/models/Clan.js';
import { config } from '../../config/index.js';

export const ocwCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('ocw')
    .setDescription('Swap positions of two clans within the same region')
    .addStringOption((opt) => opt.setName('clan_a_server_id').setDescription('First clan server ID').setRequired(true))
    .addStringOption((opt) => opt.setName('clan_b_server_id').setDescription('Second clan server ID').setRequired(true))
    .addStringOption((opt) => opt.setName('region').setDescription('Region').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    if (!(interaction.member as any)?.roles?.cache?.has(config.community.roles.admin)) {
      await interaction.reply({ content: 'Admin only.', ephemeral: true });
      return;
    }
    const clanA = await Clan.findOne({ serverId: interaction.options.getString('clan_a_server_id')! });
    const clanB = await Clan.findOne({ serverId: interaction.options.getString('clan_b_server_id')! });
    const region = interaction.options.getString('region')!;

    if (!clanA || !clanB) {
      await interaction.reply({ content: 'One or both clans not found.', ephemeral: true });
      return;
    }

    const regA = clanA.regions.find((r) => r.region === region);
    const regB = clanB.regions.find((r) => r.region === region);
    if (!regA || !regB) {
      await interaction.reply({ content: `One or both clans are not in ${region}.`, ephemeral: true });
      return;
    }

    const tempRank = regA.rank;
    regA.rank = regB.rank;
    regB.rank = tempRank;

    await clanA.save();
    await clanB.save();

    await interaction.reply({ content: `Swapped **${clanA.name}** (#${regB.rank}) and **${clanB.name}** (#${regA.rank}) in ${region}.`, ephemeral: true });
  },
};
