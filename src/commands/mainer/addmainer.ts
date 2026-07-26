import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Clan } from '../../database/models/Clan.js';
import { Mainer } from '../../database/models/Mainer.js';
import { Player } from '../../database/models/Player.js';
import { config } from '../../config/index.js';
import { buildNewMainerEmbed } from '../../utils/embeds.js';
import { isAdmin } from '../../utils/permissions.js';

export const addmainerCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('addmainer')
    .setDescription('Force a user to main a clan (Admins only — immediately war eligible)')
    .addStringOption((opt) => opt.setName('user_id').setDescription('Discord user ID').setRequired(true))
    .addStringOption((opt) => opt.setName('clan_name').setDescription('Clan name').setRequired(true))
    .addStringOption((opt) => opt.setName('region').setDescription('Region').setRequired(true).addChoices(
      { name: 'EU', value: 'EU' }, { name: 'AS', value: 'AS' }, { name: 'NA', value: 'NA' }, { name: 'SA', value: 'SA' }, { name: 'OCE', value: 'OCE' },
    )) as SlashCommandBuilder,
  async execute(interaction) {
    if (!isAdmin(interaction.member as any)) {
      await interaction.reply({ content: 'Admin only.', ephemeral: true });
      return;
    }

    const userId = interaction.options.getString('user_id')!;
    const clanName = interaction.options.getString('clan_name')!;
    const region = interaction.options.getString('region')!;

    const clan = await Clan.findOne({ name: { $regex: new RegExp(clanName, 'i') } });
    if (!clan) {
      await interaction.reply({ content: 'Clan not found.', ephemeral: true });
      return;
    }

    const player = await Player.findOne({ userId });
    if (!player || !player.verified) {
      await interaction.reply({ content: `<@${userId}> has not verified their Roblox account.`, ephemeral: true });
      return;
    }

    const existing = await Mainer.findOne({ userId, region });
    if (existing) {
      await interaction.reply({ content: `<@${userId}> is already a mainer in ${region}.`, ephemeral: true });
      return;
    }

    // Immediately war eligible — admin forced
    const warEligibleAt = new Date();

    const mainer = await Mainer.create({
      userId,
      robloxUsername: player.robloxUsername,
      robloxId: player.robloxId,
      clanId: clan.clanId,
      region,
      warEligibleAt,
    });

    const channel = await interaction.client.channels.fetch(config.community.channels.mainerAnnc).catch(() => null);
    if (channel?.isTextBased()) {
      const embed = buildNewMainerEmbed(mainer, clan);
      await (channel as any).send({ content: `<@${userId}> <@${clan.ownerId}> Use \`/unmain\` at any time to leave the clan.`, embeds: [embed] });
    }

    await interaction.reply({ content: `<@${userId}> force-added as a mainer for **${clan.name}** in ${region}. War eligible immediately.`, ephemeral: true });
  },
};
