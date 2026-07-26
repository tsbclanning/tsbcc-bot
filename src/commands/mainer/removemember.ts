import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Clan } from '../../database/models/Clan.js';
import { Mainer } from '../../database/models/Mainer.js';
import { config } from '../../config/index.js';
import { buildMainerLeftEmbed } from '../../utils/embeds.js';

export const removememberCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('removemember')
    .setDescription('Remove a mainer from your clan (Clan Leaders only)')
    .addStringOption((opt) => opt.setName('user_id').setDescription('Discord user ID of the mainer to remove').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    const targetUserId = interaction.options.getString('user_id')!;
    const clan = await Clan.findOne({ ownerId: interaction.user.id });

    if (!clan) {
      await interaction.reply({ content: 'You do not own a clan.', ephemeral: true });
      return;
    }

    const mainer = await Mainer.findOne({ userId: targetUserId, clanId: clan.clanId });
    if (!mainer) {
      await interaction.reply({ content: `<@${targetUserId}> is not a mainer in your clan.`, ephemeral: true });
      return;
    }

    await Mainer.deleteOne({ _id: mainer._id });

    // Post "Mainer Left" announcement
    const channel = await interaction.client.channels.fetch(config.community.channels.mainerAnnc).catch(() => null);
    if (channel?.isTextBased()) {
      const embed = buildMainerLeftEmbed(mainer, clan);
      await (channel as any).send({ embeds: [embed] });
    }

    await interaction.reply({ content: `<@${targetUserId}> removed from **${clan.name}**.`, ephemeral: true });
  },
};
