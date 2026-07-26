import type { ButtonInteraction } from 'discord.js';
import { StringSelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import { Clan } from '../../database/models/Clan.js';
import { SelectCustomId, ButtonCustomId } from '../../types/index.js';

export async function handleAssignWM(interaction: ButtonInteraction): Promise<void> {
  await handleAssign(interaction, 'War Manager');
}

export async function handleAssignRL(interaction: ButtonInteraction): Promise<void> {
  await handleAssign(interaction, 'Region Lead');
}

export async function handleRemoveWM(interaction: ButtonInteraction): Promise<void> {
  await handleRemove(interaction, 'War Manager');
}

export async function handleRemoveRL(interaction: ButtonInteraction): Promise<void> {
  await handleRemove(interaction, 'Region Lead');
}

async function handleAssign(interaction: ButtonInteraction, type: string): Promise<void> {
  const clans = await Clan.find({ ownerId: interaction.user.id, status: 'ACTIVE' });
  if (clans.length === 0) {
    await interaction.reply({ content: 'You do not own a clan.', ephemeral: true });
    return;
  }

  // Gather all clan/region combos
  const options: { label: string; value: string }[] = [];
  for (const clan of clans) {
    for (const r of clan.regions) {
      options.push({
        label: `${clan.name} ${r.region}`,
        value: `${clan.clanId}|${r.region}|${type}`,
      });
    }
  }

  if (options.length === 0) {
    await interaction.reply({ content: 'Your clan has no regions registered.', ephemeral: true });
    return;
  }

  const select = new StringSelectMenuBuilder()
    .setCustomId(SelectCustomId.ASSIGN_REGION)
    .setPlaceholder(`Select which clan + region to assign a ${type} to`)
    .addOptions(options);

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
  await interaction.reply({ content: `Select which clan + region you want to assign a **${type}** to:`, components: [row], ephemeral: true });
}

async function handleRemove(interaction: ButtonInteraction, type: string): Promise<void> {
  const clans = await Clan.find({ $or: [{ ownerId: interaction.user.id }, { 'regions.warManager': interaction.user.id }, { 'regions.regionLead': interaction.user.id }], status: 'ACTIVE' });
  if (clans.length === 0) {
    await interaction.reply({ content: 'You have no assignments to remove.', ephemeral: true });
    return;
  }

  const options: { label: string; description: string; value: string }[] = [];
  for (const clan of clans) {
    for (const r of clan.regions) {
      if (type === 'War Manager' && r.warManager) {
        const isOwner = clan.ownerId === interaction.user.id;
        const isSelf = r.warManager === interaction.user.id;
        options.push({ label: `${clan.name} ${r.region}`, description: isSelf ? 'Self-resign' : 'Remove assignment', value: `${clan.clanId}|${r.region}|WM|${isSelf ? 'self' : 'owner'}` });
      }
      if (type === 'Region Lead' && r.regionLead) {
        const isOwner = clan.ownerId === interaction.user.id;
        const isSelf = r.regionLead === interaction.user.id;
        options.push({ label: `${clan.name} ${r.region}`, description: isSelf ? 'Self-resign' : 'Remove assignment', value: `${clan.clanId}|${r.region}|RL|${isSelf ? 'self' : 'owner'}` });
      }
    }
  }

  if (options.length === 0) {
    await interaction.reply({ content: `No ${type} assignments found.`, ephemeral: true });
    return;
  }

  const select = new StringSelectMenuBuilder()
    .setCustomId(SelectCustomId.REMOVE_ASSIGNMENT)
    .setPlaceholder('Select an assignment to remove')
    .addOptions(options);

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
  await interaction.reply({ content: 'Select an assignment to remove:', components: [row], ephemeral: true });
}
