import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Clan } from '../../database/models/Clan.js';
import { isAdmin } from '../../utils/permissions.js';
import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

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

    // Send approval request if not admin
    if (!isAdmin(interaction.member as any)) {
      const oldName = clan.name;
      const approveBtn = new ButtonBuilder().setCustomId(`approve_rename:${clan.clanId}`).setLabel('Approve').setStyle(ButtonStyle.Success);
      const denyBtn = new ButtonBuilder().setCustomId(`deny_rename:${clan.clanId}`).setLabel('Deny').setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(approveBtn, denyBtn);

      // Post in admin approval channel (use bot commands channel as fallback)
      const channel = interaction.channel;
      if (channel?.isTextBased()) {
        await (channel as any).send({
          content: `**Rename Request**\n**${oldName}** → **${newName}**\nRequested by: <@${interaction.user.id}>\nServer ID: ${serverId}`,
          components: [row],
        });
      }
      await interaction.reply({ content: 'Rename request sent for admin approval. Trolling rename requests will result in a strike.', ephemeral: true });
      return;
    }

    // Admin can directly rename
    clan.name = newName;
    await clan.save();
    await interaction.reply({ content: `Clan renamed to **${newName}**.`, ephemeral: true });
  },
};
