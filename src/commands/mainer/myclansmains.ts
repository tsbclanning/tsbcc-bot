import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interface.js';
import { Clan } from '../../database/models/Clan.js';
import { Mainer } from '../../database/models/Mainer.js';

export const myclansmainsCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('myclansmains')
    .setDescription('View who mains your clan (Clan Leader, War Manager, or Region Lead)')
    .addStringOption((opt) => opt.setName('region').setDescription('Region').setRequired(true).addChoices(
      { name: 'EU', value: 'EU' }, { name: 'AS', value: 'AS' }, { name: 'NA', value: 'NA' }, { name: 'SA', value: 'SA' }, { name: 'OCE', value: 'OCE' },
    )) as SlashCommandBuilder,
  async execute(interaction) {
    const region = interaction.options.getString('region')!;
    // Find clan where user is owner, WM, or RL
    const clans = await Clan.find({ status: 'ACTIVE' });
    let clan: typeof clans[0] | null = null;

    for (const c of clans) {
      const r = c.regions.find((rr) => rr.region === region);
      if (c.ownerId === interaction.user.id || r?.warManager === interaction.user.id || r?.regionLead === interaction.user.id) {
        clan = c;
        break;
      }
    }

    if (!clan) {
      await interaction.reply({ content: 'You are not a Clan Leader, War Manager, or Region Lead in this region.', ephemeral: true });
      return;
    }

    const mainers = await Mainer.find({ clanId: clan.clanId, region });
    if (mainers.length === 0) {
      await interaction.reply({ content: `No mainers for **${clan.name}** in ${region}.`, ephemeral: true });
      return;
    }
    const list = mainers.map((m, i) => `${i + 1}. <@${m.userId}> (${m.robloxUsername})`).join('\n');
    await interaction.reply({ content: `**${clan.name}** — ${region} Mainers (${mainers.length}):\n${list}`, ephemeral: true });
  },
};
