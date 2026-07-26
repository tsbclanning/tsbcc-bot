import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Clan } from '../../database/models/Clan.js';
import { config } from '../../config/index.js';
import { buildScoreApprovalEmbed } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';

export const scorematchCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('scorematch')
    .setDescription('Submit a match result for approval')
    .addStringOption((opt) => opt.setName('winner_id').setDescription('Winning clan server ID or name').setRequired(true))
    .addStringOption((opt) => opt.setName('loser_id').setDescription('Losing clan server ID or name').setRequired(true))
    .addStringOption((opt) => opt.setName('region').setDescription('Region').setRequired(true).addChoices(
      { name: 'EU', value: 'EU' }, { name: 'AS', value: 'AS' }, { name: 'NA', value: 'NA' }, { name: 'SA', value: 'SA' }, { name: 'OCE', value: 'OCE' },
    ))
    .addStringOption((opt) => opt.setName('score').setDescription('Score (e.g. 5-3)').setRequired(false))
    .addStringOption((opt) => opt.setName('referee').setDescription('Referee 1 (optional)').setRequired(false))
    .addStringOption((opt) => opt.setName('referee2').setDescription('Referee 2 (optional)').setRequired(false))
    .addBooleanOption((opt) => opt.setName('auto').setDescription('Auto win?').setRequired(false))
    .addStringOption((opt) => opt.setName('proof').setDescription('Proof (optional)').setRequired(false))
    .addStringOption((opt) => opt.setName('mvp').setDescription('MVP of the match (optional)').setRequired(false))
    .addStringOption((opt) => opt.setName('india').setDescription('India score').setRequired(false))
    .addStringOption((opt) => opt.setName('singapore').setDescription('Singapore score').setRequired(false))
    .addStringOption((opt) => opt.setName('japan').setDescription('Japan score').setRequired(false))
    .addStringOption((opt) => opt.setName('nac').setDescription('NAC score').setRequired(false))
    .addStringOption((opt) => opt.setName('naw').setDescription('NAW score').setRequired(false))
    .addStringOption((opt) => opt.setName('nae').setDescription('NAE score').setRequired(false))
    .addStringOption((opt) => opt.setName('germany').setDescription('Germany score').setRequired(false)) as SlashCommandBuilder,
  async execute(interaction) {
    const winnerId = interaction.options.getString('winner_id')!;
    const loserId = interaction.options.getString('loser_id')!;
    const region = interaction.options.getString('region')!;
    const score = interaction.options.getString('score') ?? 'N/A';
    const autoWin = interaction.options.getBoolean('auto') ?? false;

    // Find clans by server ID or name
    const winnerClan = await Clan.findOne({ $or: [{ serverId: winnerId }, { name: { $regex: new RegExp(winnerId, 'i') } }], status: 'ACTIVE' });
    const loserClan = await Clan.findOne({ $or: [{ serverId: loserId }, { name: { $regex: new RegExp(loserId, 'i') } }], status: 'ACTIVE' });

    if (!winnerClan || !loserClan) {
      await interaction.reply({ content: 'One or both clans not found.', ephemeral: true });
      return;
    }

    const winnerRegion = winnerClan.regions.find((r) => r.region === region);
    const loserRegion = loserClan.regions.find((r) => r.region === region);

    if (!winnerRegion || !loserRegion) {
      await interaction.reply({ content: 'One or both clans are not in this region.', ephemeral: true });
      return;
    }

    // Post to score logs for approval
    const channel = await interaction.client.channels.fetch(config.war.channels.scoreLogs).catch(() => null);
    if (!channel?.isTextBased()) {
      await interaction.reply({ content: 'Score logs channel not found.', ephemeral: true });
      return;
    }

    const [embed, row] = buildScoreApprovalEmbed(
      winnerClan.name, winnerRegion.rank,
      loserClan.name, loserRegion.rank,
      region, score, interaction.user.id,
    );

    // Store scorematch data in embed footer for approval handler
    embed.setFooter({ text: `${winnerClan.clanId}|${loserClan.clanId}|${region}|${autoWin ? '1' : '0'}` });

    await (channel as any).send({
      content: `<@&${config.war.roles.warManagerObserver}>`,
      embeds: [embed],
      components: [row],
    });

    await interaction.reply({ content: `Score submitted for approval: **${winnerClan.name}** vs **${loserClan.name}** (${score}). A War Manager Observer must approve.`, ephemeral: true });
    logger.info(`Scorematch submitted: ${winnerClan.name} vs ${loserClan.name} in ${region}`);
  },
};
