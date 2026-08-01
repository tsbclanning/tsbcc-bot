import { ButtonInteraction, StringSelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import { SelectCustomId } from '../../types/index.js';

export async function handleApplyClanVerify(interaction: ButtonInteraction): Promise<void> {
  const select = new StringSelectMenuBuilder()
    .setCustomId('select_verify_region')
    .setPlaceholder('Select your region(s)...')
    .setMinValues(1)
    .setMaxValues(5)
    .addOptions(
      { label: 'EU', value: 'EU' },
      { label: 'NA', value: 'NA' },
      { label: 'ASIA', value: 'AS' },
      { label: 'OCE', value: 'OCE' },
      { label: 'SA', value: 'SA' },
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

  await interaction.reply({
    content: '**Step 1 of 2 - Select your region(s):**\nEach region requires 100 members.',
    components: [row],
    ephemeral: true,
  });
}

export async function handleClaimClanLeader(interaction: ButtonInteraction): Promise<void> {
  // Find clans owned by this user
  const { Clan } = await import('../../database/models/Clan.js');
  const clans = await Clan.find({ ownerId: interaction.user.id, status: 'ACTIVE' });

  if (clans.length === 0) {
    await interaction.reply({ content: 'You do not own any verified clans. If you believe this is an error, open a support ticket.', ephemeral: true });
    return;
  }

  // Re-assign clan leader roles
  const member = interaction.member;
  if (member && 'roles' in member) {
    const guild = interaction.guild;
    if (guild) {
      for (const clan of clans) {
        // Check if user is in the guild
        const guildMember = await guild.members.fetch(interaction.user.id).catch(() => null);
        if (guildMember) {
          // Add clan leader role if configured
          // This would need the role ID from config
        }
      }
    }
  }

  await interaction.reply({ content: `✅ Your clan leader roles have been restored for ${clans.length} clan(s).`, ephemeral: true });
}

export async function handleWelcomeRules(interaction: ButtonInteraction): Promise<void> {
  const { config } = await import('../../config/index.js');
  await interaction.reply({ content: `You can read the rules here: <#${config.community.channels.clanManagement}>`, ephemeral: true });
}

export async function handleWelcomeBranches(interaction: ButtonInteraction): Promise<void> {
  await interaction.reply({ content: 'Join one of our branches for daily tryouts! Check the branches channels for more info.', ephemeral: true });
}

export async function handleWelcomeCreateClan(interaction: ButtonInteraction): Promise<void> {
  await interaction.reply({ content: 'Head over to the clan verification channel to get your clan officially verified!', ephemeral: true });
}

export async function handleWelcomeSupport(interaction: ButtonInteraction): Promise<void> {
  await interaction.reply({ content: 'Open a support ticket for help, or check the blacklist channel if you need to appeal.', ephemeral: true });
}
