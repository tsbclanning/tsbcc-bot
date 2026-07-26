import type { StringSelectMenuInteraction } from 'discord.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { Clan } from '../../database/models/Clan.js';
import { ModalCustomId, ModalInputCustomId } from '../../types/index.js';
import { buildMyClanEmbed } from '../../utils/embeds.js';

export async function handleClanManagementSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  const value = interaction.values[0];
  const clan = await Clan.findOne({ ownerId: interaction.user.id, status: 'ACTIVE' });

  if (!clan) {
    await interaction.reply({ content: 'You do not own a clan.', ephemeral: true });
    return;
  }

  switch (value) {
    case 'my_clan': {
      const embed = buildMyClanEmbed(clan);
      await interaction.reply({ embeds: [embed], ephemeral: true });
      break;
    }
    case 'rename_clan': {
      const modal = new ModalBuilder()
        .setCustomId(ModalCustomId.CLAN_RENAME)
        .setTitle('Rename Clan');
      const input = new TextInputBuilder()
        .setCustomId(ModalInputCustomId.CLAN_NAME)
        .setLabel('New clan name')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
      await interaction.showModal(modal);
      break;
    }
    case 'switch_owner': {
      const modal = new ModalBuilder()
        .setCustomId(ModalCustomId.CLAN_OWNER)
        .setTitle('Transfer Clan Ownership');
      const input = new TextInputBuilder()
        .setCustomId(ModalInputCustomId.NEW_OWNER_ID)
        .setLabel('Discord ID of the new owner')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
      await interaction.showModal(modal);
      break;
    }
    case 'merge_clan': {
      const modal = new ModalBuilder()
        .setCustomId(ModalCustomId.CLAN_MERGE)
        .setTitle('Merge Clan');
      const input = new TextInputBuilder()
        .setCustomId(ModalInputCustomId.MERGE_TARGET_ID)
        .setLabel('Server ID of the clan to merge into')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
      await interaction.showModal(modal);
      break;
    }
    case 'expand_clan': {
      await interaction.reply({ content: 'Please use the clan verification flow to expand into a new region. Use `/clanverify` with your clan details and the new region.', ephemeral: true });
      break;
    }
    case 'disband_clan': {
      clan.status = 'DISBANDED';
      await clan.save();
      await interaction.reply({ content: `**${clan.name}** has been disbanded. All leaderboard entries will be removed on next refresh.`, ephemeral: true });
      break;
    }
  }
}
