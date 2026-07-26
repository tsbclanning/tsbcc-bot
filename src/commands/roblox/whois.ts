import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Player } from '../../database/models/Player.js';
import { Mainer } from '../../database/models/Mainer.js';
import { Clan } from '../../database/models/Clan.js';

export const robloxWhoisCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('roblox-whois')
    .setDescription('Look up Roblox and Discord link associations')
    .addStringOption((opt) => opt.setName('user_id').setDescription('Discord user ID').setRequired(false))
    .addStringOption((opt) => opt.setName('roblox_username').setDescription('Roblox username').setRequired(false)) as SlashCommandBuilder,
  async execute(interaction) {
    const userId = interaction.options.getString('user_id');
    const robloxUsername = interaction.options.getString('roblox_username');

    let player;
    if (userId) {
      player = await Player.findOne({ userId });
    } else if (robloxUsername) {
      player = await Player.findOne({ robloxUsername: { $regex: new RegExp(robloxUsername, 'i') } });
    }

    if (!player) {
      await interaction.reply({ content: 'No matching user found.', ephemeral: true });
      return;
    }

    const mainers = await Mainer.find({ userId: player.userId });
    let mainerInfo = 'Not a mainer for any clan';
    if (mainers.length > 0) {
      const clans = await Promise.all(mainers.map(async (m) => {
        const clan = await Clan.findOne({ clanId: m.clanId });
        return `${clan?.name ?? 'Unknown'} (${m.region})`;
      }));
      mainerInfo = clans.join(', ');
    }

    const embed = new EmbedBuilder()
      .setTitle('Whois Lookup')
      .addFields(
        { name: 'Discord', value: `<@${player.userId}> (${player.userId})`, inline: true },
        { name: 'Roblox', value: player.verified ? `**${player.robloxUsername}** (ID: ${player.robloxId})` : 'Not verified', inline: true },
        { name: 'Blacklisted', value: player.blacklisted ? '❌ Yes' : '✅ No', inline: true },
        { name: 'Mainer', value: mainerInfo, inline: false },
      )
      .setColor(0x5865f2);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
