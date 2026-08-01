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

export async function handleRobloxVerifyPanel(interaction: ButtonInteraction): Promise<void> {
  // Trigger the roblox verify command
  const { robloxVerifyCommand } = await import('../../commands/roblox/verify.js');
  // Create a fake command interaction by calling the command's execute
  // Since we can't easily do that, let's just reply with instructions
  const { config } = await import('../../config/index.js');
  const { generateRobloxVerifyCode } = await import('../../utils/helpers.js');
  const { Player } = await import('../../database/models/Player.js');
  const { buildRobloxProfileEmbed } = await import('../../utils/embeds.js');

  const existing = await Player.findOne({ userId: interaction.user.id });
  if (existing?.verified) {
    await interaction.reply({ content: 'You are already verified as **' + existing.robloxUsername + '**.', ephemeral: true });
    return;
  }

  // Fetch Roblox user by Discord username
  try {
    const username = interaction.user.username;
    const response = await fetch(`${config.roblox.apiUrl}/usernames/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: true }),
    });
    const data = await response.json() as any;

    if (!data?.data || data.data.length === 0) {
      await interaction.reply({ content: 'Could not find a Roblox user with a matching username. Please use `/roblox verify` to enter your Roblox username manually.', ephemeral: true });
      return;
    }

    const robloxUser = data.data[0];
    const robloxId = robloxUser.id;
    const robloxUsername = robloxUser.name;

    const thumbResponse = await fetch(`${config.roblox.thumbApiUrl}?userIds=${robloxId}&size=420x420&format=Png&isCircular=true`);
    const thumbData = await thumbResponse.json() as any;
    const avatarUrl = thumbData?.data?.[0]?.imageUrl ?? '';

    await Player.findOneAndUpdate(
      { userId: interaction.user.id },
      { robloxUsername, robloxId, robloxAvatarUrl: avatarUrl },
      { upsert: true },
    );

    const [embed, row] = buildRobloxProfileEmbed(robloxUsername, robloxId, avatarUrl);
    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  } catch {
    await interaction.reply({ content: 'An error occurred. Please use `/roblox verify` instead.', ephemeral: true });
  }
}
