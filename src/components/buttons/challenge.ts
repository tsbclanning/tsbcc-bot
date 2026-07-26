import type { ButtonInteraction } from 'discord.js';
import { StringSelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import { Clan } from '../../database/models/Clan.js';
import { SelectCustomId } from '../../types/index.js';
import { logger } from '../../utils/logger.js';

export async function handleOpenChallengeButton(interaction: ButtonInteraction): Promise<void> {
  // Find clans where user is owner, WM, or RL
  const clans = await Clan.find({ status: 'ACTIVE' });
  const userClans: { clan: typeof clans[0]; region: string; rank: number; role: string }[] = [];

  for (const clan of clans) {
    for (const r of clan.regions) {
      let role = '';
      if (clan.ownerId === interaction.user.id) role = 'Owner';
      else if (r.warManager === interaction.user.id) role = 'War Manager';
      else if (r.regionLead === interaction.user.id) role = 'Region Lead';
      if (role) userClans.push({ clan, region: r.region, rank: r.rank, role });
    }
  }

  if (userClans.length === 0) {
    await interaction.reply({ content: 'You are not a Clan Owner, War Manager, or Region Lead.', ephemeral: true });
    return;
  }

  if (userClans.length === 1) {
    // Direct to clan selection
    const uc = userClans[0];
    await showChallengeTargetDropdown(interaction, uc.clan, uc.region, uc.rank, uc.role);
  } else {
    // Show clan/region selector
    const select = new StringSelectMenuBuilder()
      .setCustomId(SelectCustomId.CHALLENGE_FROM)
      .setPlaceholder('Select which clan/region to challenge from')
      .addOptions(userClans.map((uc) => ({
        label: `${uc.clan.name} (${uc.region})`,
        description: `Rank #${uc.rank} — ${uc.role}`,
        value: `${uc.clan.clanId}|${uc.region}|${uc.rank}|${uc.role}`,
      })));

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
    await interaction.reply({ content: 'You have multiple clan/region contexts, select which one to challenge from:', components: [row], ephemeral: true });
  }
}

async function showChallengeTargetDropdown(
  interaction: ButtonInteraction,
  clan: any,
  region: string,
  rank: number,
  role: string,
): Promise<void> {
  const allClans = await Clan.find({ status: 'ACTIVE' });
  const regionClans = allClans
    .filter((c) => c.regions.some((r) => r.region === region))
    .map((c) => ({ clan: c, rank: c.regions.find((r) => r.region === region)!.rank }))
    .filter((c) => c.rank < rank && c.rank >= rank - 10) // 10-spot rule
    .sort((a, b) => a.rank - b.rank);

  if (regionClans.length === 0) {
    await interaction.reply({ content: 'No clans available to challenge within your range.', ephemeral: true });
    return;
  }

  const select = new StringSelectMenuBuilder()
    .setCustomId(SelectCustomId.CHALLENGE_TARGET)
    .setPlaceholder('Select a clan to challenge...')
    .addOptions(regionClans.map((c) => ({
      label: `${c.clan.name} (#${c.rank})`,
      value: `${clan.clanId}|${region}|${rank}|${c.clan.clanId}|${c.rank}`,
    })));

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
  await interaction.reply({
    content: `Challenging as **${role}** of **${clan.name}** (Top ${rank}, ${region}). Select a clan to challenge:`,
    components: [row],
    ephemeral: true,
  });
}

export { showChallengeTargetDropdown };
