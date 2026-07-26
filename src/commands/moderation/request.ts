import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Warning } from '../../database/models/Warning.js';
import { Clan } from '../../database/models/Clan.js';
import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { isAdmin } from '../../utils/permissions.js';

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

    const channel = interaction.channel;
    if (channel?.isTextBased()) {
      await (channel as any).send({
        content: `**Clan Action Request**\nType: ${type}\nClan: ${clan.name}\nReason: ${reason}\nRequested by: <@${interaction.user.id}>`,
        components: [row],
      });
    }

    await interaction.reply({ content: 'Request submitted for staff approval.', ephemeral: true });
  },
};
