import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Verification } from '../../database/models/Verification.js';
import { generateMainerCode } from '../../utils/helpers.js';
import { Region } from '../../types/index.js';

export const clanverifyCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('clanverify')
    .setDescription('Verify clan ownership in the verification server')
    .addStringOption((opt) => opt.setName('clan_name').setDescription('Your clan name').setRequired(true))
    .addStringOption((opt) => opt.setName('server_id').setDescription('Your clan server ID').setRequired(true))
    .addStringOption((opt) => opt.setName('region').setDescription('Region').setRequired(true).addChoices(
      { name: 'EU', value: Region.EU },
      { name: 'AS', value: Region.AS },
      { name: 'NA', value: Region.NA },
      { name: 'SA', value: Region.SA },
      { name: 'OCE', value: Region.OCE },
    )) as SlashCommandBuilder,
  async execute(interaction) {
    const clanName = interaction.options.getString('clan_name')!;
    const serverId = interaction.options.getString('server_id')!;
    const region = interaction.options.getString('region')!;

    const code = generateMainerCode();
    const verification = await Verification.create({
      verificationId: `ver-${Date.now()}`,
      clanName,
      ownerId: interaction.user.id,
      serverId,
      region,
      code,
      status: 'PENDING',
    });

    await interaction.reply({
      content: `Verification started for **${clanName}**. Your verification code is: **${code}**\n\nPlease put this code in your clan server and invite the bot. The bot will join, check your member count (minimum 100), and then leave. A moderator will approve your clan.`,
      ephemeral: true,
    });
  },
};
