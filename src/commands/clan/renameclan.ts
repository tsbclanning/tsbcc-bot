import { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Clan } from '../../database/models/Clan.js';
import { config } from '../../config/index.js';
import { isAdmin } from '../../utils/permissions.js';

export const renameclanCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('renameclan')
    .setDescription('Rename a clan globally across all regions using its server ID')
    .addStringOption((opt) => opt.setName('server_id').setDescription('Clan server ID').setRequired(true))
    .addStringOption((opt) => opt.setName('new_name').setDescription('New clan name').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    const serverId = interaction.options.getString('server_id')!;
    const newName = interaction.options.getString('new_name')!;
    const clan = await Clan.findOne({ serverId });

    if (!clan) {
      await interaction.reply({ content: 'No clan found with that server ID.', ephemeral: true });
      return;
    }

    if (clan.ownerId !== interaction.user.id && !isAdmin(interaction.member as any)) {
      await interaction.reply({ content: 'Only the clan owner or admins can rename a clan.', ephemeral: true });
      return;
    }

    // Admin can directly rename
    if (isAdmin(interaction.member as any)) {
      clan.name = newName;
      await clan.save();
      await interaction.reply({ content: `Clan renamed to **${newName}**.`, ephemeral: true });
      return;
    }

    // Send approval request to mod-logs
    const approveBtn = new ButtonBuilder().setCustomId(`approve_rename:${clan.clanId}`).setLabel('Approve').setStyle(ButtonStyle.Success);
    const denyBtn = new ButtonBuilder().setCustomId(`deny_rename:${clan.clanId}`).setLabel('Deny').setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(approveBtn, denyBtn);

    const embed = new EmbedBuilder()
      .setTitle('Rename Request — Needs Approval')
      .addFields(
        { name: 'Clan', value: clan.name, inline: true },
        { name: 'New Name', value: newName, inline: true },
        { name: 'Requested by', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Server ID', value: serverId, inline: true },
      )
      .setColor(0xfee75c)
      .setTimestamp();

    const modLogsChannel = await interaction.client.channels.fetch(config.community.channels.modLogs).catch(() => null);
    if (modLogsChannel?.isTextBased()) {
      await (modLogsChannel as any).send({ embeds: [embed], components: [row] });
    }

    await interaction.reply({ content: 'Rename request sent to staff for approval. Trolling rename requests will result in a strike.', ephemeral: true });
  },
};
