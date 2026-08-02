import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelType, PermissionFlagsBits, type Client, type TextChannel } from 'discord.js';
import type { IClan, IClanRegion } from '../database/models/Clan.js';
import type { IMainer } from '../database/models/Mainer.js';
import { config } from '../config/index.js';
import { ButtonCustomId, SelectCustomId, Region, TicketType } from '../types/index.js';
import { formatDate } from '../utils/helpers.js';

// ─── Leaderboard Embed ───
export function buildLeaderboardEmbed(region: string, clans: IClan[]): EmbedBuilder[] {
  const embeds: EmbedBuilder[] = [];
  const pageSize = config.settings.leaderboardPageSize;
  const totalPages = Math.ceil(clans.length / pageSize) || 1;

  for (let page = 0; page < totalPages; page++) {
    const slice = clans.slice(page * pageSize, (page + 1) * pageSize);
    let description = '';

    for (const clan of slice) {
      const regionData = clan.regions.find((r) => r.region === region);
      if (!regionData) continue;

      const rank = regionData.rank;
      const leaderMention = `<@${clan.ownerId}>`;
      const warManager = regionData.warManager ? `<@${regionData.warManager}>` : '';
      const rgTag = regionData.warManager ? 'R/G' : '';

      let line = `${rank}. ${clan.name} | ${leaderMention}`;
      if (rgTag) line += ` ${rgTag}`;
      if (warManager) line += ` ${warManager}`;
      description += line + '\n';
    }

    const embed = new EmbedBuilder()
      .setTitle(`${region} Leaderboard`)
      .setDescription(description || 'No clans ranked.')
      .setColor(0x5865f2);

    if (totalPages > 1) {
      embed.setFooter({ text: `Page ${page + 1}/${totalPages}` });
    }

    embeds.push(embed);
  }

  return embeds;
}

// ─── Clan Management Dropdown ───
export function buildClanManagementEmbed(): [EmbedBuilder, ActionRowBuilder<StringSelectMenuBuilder>] {
  const embed = new EmbedBuilder()
    .setTitle('Clan Management')
    .setDescription('Use the dropdown below to manage your clan. Select an option to get started.')
    .setColor(0x5865f2);

  const select = new StringSelectMenuBuilder()
    .setCustomId(SelectCustomId.CLAN_MANAGEMENT)
    .setPlaceholder('Manage your clan...')
    .addOptions(
      { label: 'My Clan', description: 'View your current clan info', value: 'my_clan' },
      { label: 'Rename Clan', description: 'Request a clan name change', value: 'rename_clan' },
      { label: 'Switch Owner', description: 'Transfer clan ownership', value: 'switch_owner' },
      { label: 'Merge Clan', description: 'Merge your clan into another', value: 'merge_clan' },
      { label: 'Expand Clan', description: 'Expand into a new region', value: 'expand_clan' },
      { label: 'Disband Clan', description: 'Permanently disband your clan', value: 'disband_clan' },
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
  return [embed, row];
}

// ─── My Clan Embed ───
export function buildMyClanEmbed(clan: IClan): EmbedBuilder {
  let description = '';
  for (const r of clan.regions) {
    description += `${clan.name} · ${r.region} #${r.rank} · ${clan.serverId}\n`;
  }
  return new EmbedBuilder()
    .setTitle('Your Clan')
    .setDescription(description || 'No clan data found.')
    .setColor(0x5865f2);
}

// ─── New Clan Mainer Embed ───
export function buildNewMainerEmbed(mainer: IMainer, clan: IClan): EmbedBuilder {
  const regionData = clan.regions.find((r) => r.region === mainer.region);
  const rankStr = regionData ? ` (#${regionData.rank})` : '';
  return new EmbedBuilder()
    .setTitle('New Clan Mainer')
    .addFields(
      { name: 'Player', value: `<@${mainer.userId}>`, inline: true },
      { name: 'Clan', value: `${clan.name}${rankStr}`, inline: true },
      { name: 'Region', value: mainer.region, inline: true },
      { name: 'War Eligible', value: formatDate(mainer.warEligibleAt), inline: true },
    )
    .setColor(0x57f287)
    .setFooter({ text: `Today at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` });
}

// ─── Mainer Left Embed ───
export function buildMainerLeftEmbed(mainer: IMainer, clan: IClan): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle('Mainer Left')
    .addFields(
      { name: 'Player', value: `<@${mainer.userId}>`, inline: true },
      { name: 'Clan', value: `${clan.name} (${mainer.region})`, inline: true },
      { name: 'Region', value: mainer.region, inline: true },
    )
    .setColor(0xed4245)
    .setFooter({ text: `Today at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` });
}

// ─── Clan Update News Embed ───
export function buildClanUpdateNewsEmbed(
  region: string,
  rank: number,
  userId: string,
  action: string,
  clanName: string,
  serverId: string,
): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle('CLAN UPDATE NEWS 📣')
    .addFields(
      { name: 'Region/s', value: region, inline: true },
      { name: 'Rank/s', value: `#${rank}`, inline: true },
      { name: 'Action', value: `<@${userId}> ${action}`, inline: false },
      { name: 'Clan', value: clanName, inline: true },
      { name: 'Server ID', value: serverId, inline: true },
    )
    .setColor(0xfee75c);
}

// ─── War Announcement Embed ───
export function buildWarAnnouncementEmbed(
  winnerName: string,
  winnerRank: number,
  loserName: string,
  loserRank: number,
  autoWin: boolean,
  newRank: number,
  region: string,
  approvedBy: string,
  sentBy: string,
): [EmbedBuilder, string] {
  let description = '';
  if (autoWin) {
    description += `Auto win granted to ${winnerName}\n`;
  }
  description += `${winnerName} moves #${winnerRank} to #${newRank}\n`;
  description += `Region: ${region}\n`;
  description += `Approved by: <@${approvedBy}>\n`;
  description += `Sent by: <@${sentBy}>`;

  const embed = new EmbedBuilder()
    .setTitle(`${winnerName} (${winnerRank}) vs ${loserName} (${loserRank})`)
    .setDescription(description)
    .setColor(autoWin ? 0xed4245 : 0x57f287);

  const ping = `<@&${config.community.roles.warPing}>`;
  return [embed, ping];
}

// ─── Challenge Panel Embed ───
export function buildChallengePanelEmbed(): [EmbedBuilder, ActionRowBuilder<ButtonBuilder>] {
  const embed = new EmbedBuilder()
    .setTitle('Challenge a Clan')
    .setDescription('Click below to open a challenge against another clan in your range.\n\nAvailable to Clan Owners, War Managers, and Region Leads.')
    

  const button = new ButtonBuilder()
    .setCustomId(ButtonCustomId.OPEN_CHALLENGE)
    .setLabel('Open a Challenge')
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
  return [embed, row];
}

// ─── CWM Assign Embed ───
export function buildCwmAssignEmbed(): [EmbedBuilder, ActionRowBuilder<ButtonBuilder>] {
  const embed = new EmbedBuilder()
    .setTitle('Assign War Manager / Region Lead')
    .setDescription([
      'Use the buttons below to assign a **War Manager** or **Region Lead** to your clan.',
      '',
      '**War Manager:** Manages war scheduling for your clan in a specific region. One per region, per clan.',
      '**Region Lead:** Represents your clan\'s leadership for a specific region. One per region, per clan.',
      '',
      'You\'ll select your clan + region, then enter the **Discord User ID** of the person to assign. They will receive a ticket and must accept or deny the request themselves.',
      '',
      '**The person you want to assign must:**',
      '• Not own a clan',
      '• Not already be a War Manager',
      '• Not already be a Region Lead',
    ].join('\n'))
    .setColor(0x5865f2);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(ButtonCustomId.ASSIGN_WM).setLabel('Assign War Manager').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(ButtonCustomId.ASSIGN_RL).setLabel('Assign Region Lead').setStyle(ButtonStyle.Secondary),
  );

  return [embed, row];
}

// ─── CWM Remove Embed ───
export function buildCwmRemoveEmbed(): [EmbedBuilder, ActionRowBuilder<ButtonBuilder>] {
  const embed = new EmbedBuilder()
    .setTitle('Remove War Manager / Region Lead')
    .setDescription([
      'Use the buttons below to remove an existing **War Manager** or **Region Lead** from your clan.',
      '',
      'You\'ll see a list of your current assignments, select one to remove it immediately.',
    ].join('\n'))
    .setColor(0xed4245);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(ButtonCustomId.REMOVE_WM).setLabel('Remove War Manager').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(ButtonCustomId.REMOVE_RL).setLabel('Remove Region Lead').setStyle(ButtonStyle.Secondary),
  );

  return [embed, row];
}

// ─── CWM2 Resign Embed ───
export function buildCwm2ResignEmbed(): [EmbedBuilder, ActionRowBuilder<ButtonBuilder>] {
  const embed = new EmbedBuilder()
    .setTitle('Resign as War Manager / Region Lead')
    .setDescription([
      'If you no longer want to serve as a **War Manager** or **Region Lead**, use the buttons below to resign immediately.',
      '',
      'If you hold the position for more than one clan or region, you\'ll be asked which one to resign from.',
    ].join('\n'))
    .setColor(0xed4245);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(ButtonCustomId.RESIGN_WM).setLabel('Resign as a Clan War Manager').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(ButtonCustomId.RESIGN_RL).setLabel('Resign as a Region Lead').setStyle(ButtonStyle.Secondary),
  );

  return [embed, row];
}

// ─── Verification DM Embed ───
export function buildVerificationDMEmbed(
  ownerMention: string,
  mainerCode: string,
  warServerInvite: string,
): { content: string; embed: EmbedBuilder; components: ActionRowBuilder<ButtonBuilder> } {
  const content = `${ownerMention} Congrats on verifying your clan! Make sure you head over to **#challenge-rules** and join the war management server: ${warServerInvite}\n\nYour mainer code is: **${mainerCode}**\n\nHere are some commands you can use:\n**/mycode** – check your mainer's code\n**/codereset** – reset it if it gets leaked\n**/myclanmainers** – see who mains your clan\n\nTo register mainers: give them the code and they use **/mainclan** (they must verify first with **/roblox verify**)\n\nFor any changes (expand, change leader, etc.) open a ticket at **#clan-management**`;

  const embed = new EmbedBuilder()
    .setTitle('War Managment (TSBCC)')
    .setColor(0x57f287);

  const button = new ButtonBuilder()
    .setCustomId(ButtonCustomId.GO_TO_SERVER)
    .setLabel('Go to Server')
    .setStyle(ButtonStyle.Link)
    .setURL(warServerInvite);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

  return { content, embed, components: row };
}

// ─── Scorematch Options Embed ───
export function buildScorematchOptionsEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle('OPTIONS')
    .addFields(
      { name: 'score', value: 'Score (e.g. 5-3)', inline: true },
      { name: 'referee', value: 'Referee 1 (optional)', inline: true },
      { name: 'referee2', value: 'Referee 2 (optional)', inline: true },
      { name: 'auto', value: 'Auto win?', inline: true },
      { name: 'proof', value: 'Proof (optional)', inline: true },
      { name: 'mvp', value: 'MVP of the match (optional)', inline: true },
      { name: 'india', value: 'India score', inline: true },
      { name: 'singapore', value: 'Singapore score', inline: true },
      { name: 'japan', value: 'Japan score', inline: true },
      { name: 'nac', value: 'NAC score', inline: true },
      { name: 'naw', value: 'NAW score', inline: true },
      { name: 'nae', value: 'NAE score', inline: true },
    )
    .setColor(0x5865f2);
}

// ─── Score Approval Embed ───
export function buildScoreApprovalEmbed(
  winnerName: string,
  winnerRank: number,
  loserName: string,
  loserRank: number,
  region: string,
  score: string,
  submittedBy: string,
): [EmbedBuilder, ActionRowBuilder<ButtonBuilder>] {
  const embed = new EmbedBuilder()
    .setTitle('Score Approval Required')
    .setDescription(
      `**${winnerName} (${winnerRank})** vs **${loserName} (${loserRank})**\n` +
      `Region: ${region}\n` +
      `Score: ${score}\n` +
      `Submitted by: <@${submittedBy}>\n\n` +
      `A War Manager Observer must approve this result.`,
    )
    .setColor(0xfee75c);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(ButtonCustomId.APPROVE_SCORE).setLabel('Approve').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(ButtonCustomId.DENY_SCORE).setLabel('Deny').setStyle(ButtonStyle.Danger),
  );

  return [embed, row];
}

// ─── Roblox Verify Embed ───
export function buildRobloxProfileEmbed(username: string, robloxId: string, avatarUrl: string): [EmbedBuilder, ActionRowBuilder<ButtonBuilder>] {
  const embed = new EmbedBuilder()
    .setTitle('Is this you?')
    .setDescription(`**${username}** (ID: ${robloxId})`)
    .setThumbnail(avatarUrl || null)
    .setColor(0x5865f2);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(ButtonCustomId.ROBLOX_CONFIRM_YES).setLabel('Yes, this is me').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(ButtonCustomId.ROBLOX_CONFIRM_NO).setLabel('No, try again').setStyle(ButtonStyle.Danger),
  );

  return [embed, row];
}

export function buildRobloxCodeEmbed(username: string, code: string): [EmbedBuilder, ActionRowBuilder<ButtonBuilder>] {
  const embed = new EmbedBuilder()
    .setTitle('Verify Your Roblox Account')
    .setDescription(
      `Hi **${username}**! To verify your Roblox account, please put the following code in your Roblox profile bio/description:\n\n` +
      `**${code}**\n\n` +
      `Once you've added it to your bio, click the button below to confirm.`,
    )
    .setColor(0x5865f2);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(ButtonCustomId.ROBLOX_CHECK_CODE).setLabel('I\'ve added the code').setStyle(ButtonStyle.Success),
  );

  return [embed, row];
}

// ─── Welcome Message Embed ───
export function buildWelcomeEmbed(): [EmbedBuilder, ActionRowBuilder<ButtonBuilder>] {
  const embed = new EmbedBuilder()
    .setTitle('Welcome to TSBCC')
    .setDescription(
      `Welcome to TSBCC!\n` +
      `The Strongest Battlegrounds Clanning Community\n` +
      `Competitive clanning, rankings, and skill based progression\n\n` +
      `**Important Notice**\n` +
      `This is an unofficial community not affiliated with Yielding Arts.\n\n` +
      `• **Rules**, reading them is mandatory.\n` +
      `• **Branches**, join one for daily tryouts.\n` +
      `• **Clan Verification**, get your clan officially verified.\n` +
      `• **Support**, open a ticket for help.\n` +
      `• **Raid Servers**, we have strong public raids and team helping.\n\n` +
      `Good luck, dominate the battlegrounds.`,
    )
    .setImage('https://media.klipy.com/gifs/teen-gojo-gojo-satoru.gif')
    .setColor(0x57f287)
    .setFooter({ text: 'TSBCC, Competitive Clanning, The Strongest Battlegrounds' });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(ButtonCustomId.WELCOME_RULES).setLabel('Rules').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(ButtonCustomId.WELCOME_BRANCHES).setLabel('Branches').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(ButtonCustomId.WELCOME_CREATE_CLAN).setLabel('Create a Clan').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(ButtonCustomId.WELCOME_SUPPORT).setLabel('Support / Blacklist').setStyle(ButtonStyle.Secondary),
  );

  return [embed, row];
}

// ─── Apply for Clan Verification Embed ───
export function buildApplyClanVerifyEmbed(): [EmbedBuilder, ActionRowBuilder<ButtonBuilder>] {
  const embed = new EmbedBuilder()
    .setTitle('Apply for Clan Verification')
    .setDescription(
      `**Minimum requirement:**\n` +
      `> 100 members (One Region Only)\n` +
      `> Must be the server owner, as in the yellow crown. If you have admin it won't matter.\n` +
      `> Multiple regions: Each region basically costs 100 members. Example: NA + EU + ASIA = 300 members required.\n\n` +
      `**Please do not ping staff.**\n` +
      `**If you want to claim ownership, make a ticket and say so (could be from a blacklisted owner or anything) and don't invite the bot in.**\n` +
      `*(If you change your mind and don't want to make a clan anymore, just say so and we'll delete it.)*\n\n` +
      `Click the button below to begin your application.`,
    )
    

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(ButtonCustomId.APPLY_CLAN_VERIFY).setLabel('Apply for Clan Verification').setStyle(ButtonStyle.Secondary),
  );

  return [embed, row];
}

// ─── Claim Clan Leader Role Embed ───
export function buildClaimClanLeaderEmbed(): [EmbedBuilder, ActionRowBuilder<ButtonBuilder>] {
  const embed = new EmbedBuilder()
    .setTitle('Claim Clan Leader Role')
    .setDescription(
      `If you left the server as a clan owner on accident, click **Claim** below to restore your clan leader roles.`,
    )
    

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(ButtonCustomId.CLAIM_CLAN_LEADER).setLabel('Claim').setStyle(ButtonStyle.Secondary),
  );

  return [embed, row];
}

// ─── Roblox Verification Panel Embed ───
export function buildRobloxVerifyPanelEmbed(): [EmbedBuilder, ActionRowBuilder<ButtonBuilder>] {
  const embed = new EmbedBuilder()
    .setTitle('🔗 Roblox Verification')
    .setDescription(
      `Link your Roblox account to your Discord and join TSBCC.\n\n` +
      `**To verify your Roblox account:**\n` +
      `Click the Verify button below, or use \`/roblox verify\`.\n\n` +
      `**To main a clan:**\n` +
      `Use \`/mainclan\` with your clan's secret code.\n\n` +
      `**Requirements**\n` +
      `› You must have a Roblox account\n` +
      `› You must be in the [TSBCC Roblox Group](https://www.roblox.com)\n` +
      `› You must be able to edit your Roblox bio`,
    )
    .setColor(0x5865f2)
    .setFooter({ text: 'TSBCC • The Strongest Battlegrounds Clanning Community' });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(ButtonCustomId.ROBLOX_VERIFY_PANEL).setLabel('Verify').setStyle(ButtonStyle.Success).setEmoji('✅'),
  );

  return [embed, row];
}
