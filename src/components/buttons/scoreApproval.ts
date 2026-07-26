import type { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { Clan } from '../../database/models/Clan.js';
import { config } from '../../config/index.js';
import { isWarManagerObserver } from '../../utils/permissions.js';
import { buildWarAnnouncementEmbed } from '../../utils/embeds.js';
import { updateLeaderboard } from '../../services/leaderboard.js';
import { logger } from '../../utils/logger.js';

export async function handleApproveScore(interaction: ButtonInteraction): Promise<void> {
  if (!isWarManagerObserver(interaction.member as any)) {
    await interaction.reply({ content: 'Only War Manager Observers can approve scores.', ephemeral: true });
    return;
  }

  const embed = interaction.message.embeds[0];
  if (!embed?.footer?.text) {
    await interaction.reply({ content: 'Could not parse score data.', ephemeral: true });
    return;
  }

  const [winnerClanId, loserClanId, region, autoWinStr] = embed.footer.text.split('|');
  const autoWin = autoWinStr === '1';

  const winnerClan = await Clan.findOne({ clanId: winnerClanId });
  const loserClan = await Clan.findOne({ clanId: loserClanId });

  if (!winnerClan || !loserClan) {
    await interaction.reply({ content: 'One or both clans not found.', ephemeral: true });
    return;
  }

  const winnerRegion = winnerClan.regions.find((r) => r.region === region);
  const loserRegion = loserClan.regions.find((r) => r.region === region);
  if (!winnerRegion || !loserRegion) {
    await interaction.reply({ content: 'Clan region data not found.', ephemeral: true });
    return;
  }

  const oldWinnerRank = winnerRegion.rank;
  const oldLoserRank = loserRegion.rank;

  // Swap ranks: winner takes loser's rank
  winnerRegion.rank = oldLoserRank;
  loserRegion.rank = oldWinnerRank;

  await winnerClan.save();
  await loserClan.save();

  // Update leaderboard
  await updateLeaderboard(interaction.client, region);

  // Post war announcement
  const warChannel = await interaction.client.channels.fetch(config.community.channels.warAnnouncements).catch(() => null);
  if (warChannel?.isTextBased()) {
    const [warEmbed, ping] = buildWarAnnouncementEmbed(
      winnerClan.name, oldWinnerRank,
      loserClan.name, oldLoserRank,
      autoWin, oldLoserRank,
      region, interaction.user.id, interaction.user.id,
    );
    await (warChannel as any).send({ content: ping, embeds: [warEmbed] });
  }

  // Disable buttons
  const disabledRow = interaction.message.components.map((row) => {
    return row;
  });
  await interaction.update({ content: '✅ Score approved by <@' + interaction.user.id + '>.', embeds: interaction.message.embeds, components: [] });

  logger.info(`Score approved: ${winnerClan.name} moves #${oldWinnerRank} to #${oldLoserRank} in ${region}`);
}

export async function handleDenyScore(interaction: ButtonInteraction): Promise<void> {
  if (!isWarManagerObserver(interaction.member as any)) {
    await interaction.reply({ content: 'Only War Manager Observers can deny scores.', ephemeral: true });
    return;
  }

  await interaction.update({ content: `❌ Score denied by <@${interaction.user.id}>.`, components: [] });
}
