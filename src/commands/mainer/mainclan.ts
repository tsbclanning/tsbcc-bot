import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Clan } from '../../database/models/Clan.js';
import { Mainer } from '../../database/models/Mainer.js';
import { Player } from '../../database/models/Player.js';
import { config } from '../../config/index.js';
import { buildNewMainerEmbed } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';
import { updateLeaderboard } from '../../services/leaderboard.js';

export const mainclanCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('mainclan')
    .setDescription('Become a mainer for a clan using their secret code')
    .addStringOption((opt) => opt.setName('code').setDescription("The clan's secret code").setRequired(true))
    .addStringOption((opt) => opt.setName('region').setDescription('Region').setRequired(true).addChoices(
      { name: 'EU', value: 'EU' }, { name: 'AS', value: 'AS' }, { name: 'NA', value: 'NA' }, { name: 'SA', value: 'SA' }, { name: 'OCE', value: 'OCE' },
    )) as SlashCommandBuilder,
  async execute(interaction) {
    const code = interaction.options.getString('code')!;
    const region = interaction.options.getString('region')!;

    // Check if player is Roblox verified
    const player = await Player.findOne({ userId: interaction.user.id });
    if (!player || !player.verified) {
      await interaction.reply({ content: 'You must verify your Roblox account first using `/roblox verify` before you can main a clan.', ephemeral: true });
      return;
    }

    // Check if already a mainer in this region
    const existingMainer = await Mainer.findOne({ userId: interaction.user.id, region });
    if (existingMainer) {
      await interaction.reply({ content: 'You are already a mainer in this region. Use `/unmain` to leave first.', ephemeral: true });
      return;
    }

    // Find clan by code
    const clan = await Clan.findOne({ mainerCode: code.toUpperCase(), status: 'ACTIVE' });
    if (!clan) {
      await interaction.reply({ content: 'Invalid clan code.', ephemeral: true });
      return;
    }

    // Check if clan exists in this region
    const regionData = clan.regions.find((r) => r.region === region);
    if (!regionData) {
      await interaction.reply({ content: `**${clan.name}** is not registered in ${region}.`, ephemeral: true });
      return;
    }

    // Create mainer
    const warEligibleAt = new Date();
    warEligibleAt.setDate(warEligibleAt.getDate() + config.settings.warEligibleDays);

    const mainer = await Mainer.create({
      userId: interaction.user.id,
      robloxUsername: player.robloxUsername,
      robloxId: player.robloxId,
      clanId: clan.clanId,
      region,
      warEligibleAt,
    });

    // Post announcement in #mainer-annc
    const channel = await interaction.client.channels.fetch(config.community.channels.mainerAnnc).catch(() => null);
    if (channel?.isTextBased()) {
      const embed = buildNewMainerEmbed(mainer, clan);
      await (channel as any).send({
        content: `<@${interaction.user.id}> <@${clan.ownerId}> Use \`/unmain\` at any time to leave the clan.`,
        embeds: [embed],
      });
    }

    await interaction.reply({ content: `You are now a mainer for **${clan.name}** in ${region}! War eligible on ${warEligibleAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`, ephemeral: true });
    logger.info(`${interaction.user.id} mained clan ${clan.name} in ${region}`);
  },
};
