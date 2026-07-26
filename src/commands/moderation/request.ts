import { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Clan } from '../../database/models/Clan.js';
import { config } from '../../config/index.js';

export const requestCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('request')
    .setDescription('Submit an official clan action request for staff approval')
    .addStringOption((opt) => opt.setName('type').setDescription('Request type').setRequired(true).addChoices(
      { name: 'Demotion', value: 'DEMOTE' },
      { name: 'Removal', value: 'REMOVE' },
      { name: 'Other', value: 'OTHER' },
    ))
    .addStringOption((opt) => opt.setName('clan_name').setDescription('Target clan name').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for request').setRequired(true)) as SlashCommandBuilder,
  async execute(interaction) {
    const type = interaction.options.getString('type')!;
    const clanName = interaction.options.getString('clan_name')!;
    const reason = interaction.options.getString('reason')!;

    const clan = await Clan.findOne({ name: { $regex: new RegExp(clanName, 'i') } });
    if (!clan) {
      await interaction.reply({ content: 'Clan not found.', ephemeral: true });
      return;
    }

    const approveBtn = new ButtonBuilder().setCustomId(`approve_request:${clan.clanId}:${type}`).setLabel('Approve').setStyle(ButtonStyle.Success);
    const denyBtn = new ButtonBuilder().setCustomId(`deny_request:${clan.clanId}:${type}`).setLabel('Deny').setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(approveBtn, denyBtn);

    const embed = new EmbedBuilder()
      .setTitle('Clan Action Request — Needs Approval')
      .addFields(
        { name: 'Type', value: type, inline: true },
        { name: 'Clan', value: clan.name, inline: true },
        { name: 'Requested by', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Reason', value: reason, inline: false },
      )
      .setColor(0xfee75c)
      .setTimestamp();

    const modLogsChannel = await interaction.client.channels.fetch(config.community.channels.modLogs).catch(() => null);
    if (modLogsChannel?.isTextBased()) {
      await (modLogsChannel as any).send({ embeds: [embed], components: [row] });
    }

    await interaction.reply({ content: 'Request submitted to staff for approval.', ephemeral: true });
  },
};
