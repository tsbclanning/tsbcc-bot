import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Mainer } from '../../database/models/Mainer.js';
import { Clan } from '../../database/models/Clan.js';
import { config } from '../../config/index.js';
import { buildMainerLeftEmbed } from '../../utils/embeds.js';

export const unmainCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('unmain')
    .setDescription('Leave your current clan as a mainer') as SlashCommandBuilder,
  async execute(interaction) {
    const mainer = await Mainer.findOne({ userId: interaction.user.id });
    if (!mainer) {
      await interaction.reply({ content: 'You are not a mainer for any clan.', ephemeral: true });
      return;
    }

    const clan = await Clan.findOne({ clanId: mainer.clanId });
    await Mainer.deleteOne({ _id: mainer._id });

    // Post "Mainer Left" announcement
    const channel = await interaction.client.channels.fetch(config.community.channels.mainerAnnc).catch(() => null);
    if (channel?.isTextBased() && clan) {
      const embed = buildMainerLeftEmbed(mainer, clan);
      await (channel as any).send({ embeds: [embed] });
    }

    await interaction.reply({ content: `You have left **${clan?.name ?? 'your clan'}**.`, ephemeral: true });
  },
};
