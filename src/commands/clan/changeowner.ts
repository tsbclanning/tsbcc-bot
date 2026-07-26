import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Clan } from '../../database/models/Clan.js';
import { buildClanUpdateNewsEmbed } from '../../utils/embeds.js';
import { config } from '../../config/index.js';

export const changeownerCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('changeowner')
    .setDescription('Transfer clan ownership via server ID')
    .addStringOption((opt) => opt.setName('server_id').setDescription('Clan server ID').setRequired(true))
    .addStringOption((opt) => opt.setName('new_owner_id').setDescription('Discord ID of the new owner').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    const serverId = interaction.options.getString('server_id')!;
    const newOwnerId = interaction.options.getString('new_owner_id')!;
    const clan = await Clan.findOne({ serverId });

    if (!clan) {
      await interaction.reply({ content: 'No clan found with that server ID.', ephemeral: true });
      return;
    }

    if (clan.ownerId !== interaction.user.id) {
      await interaction.reply({ content: 'Only the clan owner can transfer ownership.', ephemeral: true });
      return;
    }

    clan.ownerId = newOwnerId;
    await clan.save();

    // Post to clanning news
    const channel = await interaction.client.channels.fetch(config.community.channels.clanningNews).catch(() => null);
    if (channel?.isTextBased()) {
      for (const r of clan.regions) {
        const embed = buildClanUpdateNewsEmbed(r.region, r.rank, newOwnerId, 'has been assigned as new clan owner', clan.name, clan.serverId);
        await (channel as any).send({ embeds: [embed] });
      }
    }

    await interaction.reply({ content: `Clan ownership transferred to <@${newOwnerId}>.`, ephemeral: true });
  },
};
