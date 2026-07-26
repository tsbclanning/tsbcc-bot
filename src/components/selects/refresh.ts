import type { StringSelectMenuInteraction } from 'discord.js';
import { Region } from '../../types/index.js';
import { refreshLeaderboard, refreshAllLeaderboards } from '../../services/leaderboard.js';

export async function handleRefreshRegionSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  const region = interaction.values[0];

  if (region === 'ALL') {
    await refreshAllLeaderboards(interaction.client);
    await interaction.reply({ content: 'All leaderboards refreshed.', ephemeral: true });
  } else {
    await refreshLeaderboard(interaction.client, region);
    await interaction.reply({ content: `Leaderboard refreshed for ${region}.`, ephemeral: true });
  }
}
