import 'dotenv/config';
import { Region } from '../types/index.js';

export const config = {
  token: process.env.DISCORD_TOKEN ?? '',
  botOwnerId: process.env.BOT_OWNER_ID ?? '',
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/tsbcc',

  community: {
    guildId: process.env.COMMUNITY_GUILD_ID ?? '',
    roles: {
      competitiveSupervisor: process.env.ROLE_COMPETITIVE_SUPERVISOR ?? '',
      seniorAdmin: process.env.ROLE_SENIOR_ADMIN ?? '',
      admin: process.env.ROLE_ADMIN ?? '',
      juniorAdmin: process.env.ROLE_JUNIOR_ADMIN ?? '',
      seniorSupport: process.env.ROLE_SENIOR_SUPPORT ?? '',
      supportStaff: process.env.ROLE_SUPPORT_STAFF ?? '',
      trialSupport: process.env.ROLE_TRIAL_SUPPORT ?? '',
      warPing: process.env.ROLE_WAR_PING ?? '',
      everyone: process.env.ROLE_EVERYONE ?? '@everyone',
    },
    channels: {
      clEu: process.env.CHANNEL_CL_EU ?? '',
      clAs: process.env.CHANNEL_CL_AS ?? '',
      clNa: process.env.CHANNEL_CL_NA ?? '',
      clSa: process.env.CHANNEL_CL_SA ?? '',
      clOce: process.env.CHANNEL_CL_OCE ?? '',
      mainerAnnc: process.env.CHANNEL_MAINER_ANNC ?? '',
      clanningNews: process.env.CHANNEL_CLANNING_NEWS ?? '',
      warAnnouncements: process.env.CHANNEL_WAR_ANNOUNCEMENTS ?? '',
      scores: process.env.CHANNEL_SCORES ?? '',
      lfFcw: process.env.CHANNEL_LF_FCW ?? '',
      scoreLogs: process.env.CHANNEL_SCORE_LOGS ?? '',
      glad5v5Rules: process.env.CHANNEL_5V5_GLAD_RULES ?? '',
      players: process.env.CHANNEL_PLAYERS ?? '',
      advertiseClan: process.env.CHANNEL_ADVERTISE_CLAN ?? '',
      botCommands: process.env.CHANNEL_BOT_COMMANDS ?? '',
      blCheck: process.env.CHANNEL_BL_CHECK ?? '',
      clanManagement: process.env.CHANNEL_CLAN_MANAGEMENT ?? '',
      verification: process.env.CHANNEL_VERIFICATION ?? '',
      challengeRules: process.env.CHANNEL_CHALLENGE_RULES ?? '',
    },
  },

  war: {
    guildId: process.env.WAR_GUILD_ID ?? '',
    roles: {
      tsbccAdmin: process.env.ROLE_TSBCC_ADMIN ?? '',
      warManagerObserver: process.env.ROLE_WAR_MANAGER_OBSERVER ?? '',
    },
    channels: {
      announcements: process.env.WAR_CHANNEL_ANNOUNCEMENTS ?? '',
      cwm: process.env.WAR_CHANNEL_CWM ?? '',
      warTickets: process.env.WAR_CHANNEL_WAR_TICKETS ?? '',
      scoreLogs: process.env.WAR_CHANNEL_SCORE_LOGS ?? '',
      glad5v5Rules: process.env.WAR_CHANNEL_5V5_GLAD_RULES ?? '',
      general: process.env.WAR_CHANNEL_GENERAL ?? '',
      botCommands: process.env.WAR_CHANNEL_BOT_COMMANDS ?? '',
      blCheck: process.env.WAR_CHANNEL_BL_CHECK ?? '',
    },
    ticketCategoryId: process.env.WAR_TICKET_CATEGORY_ID ?? '',
  },

  roblox: {
    verifyCodePrefix: process.env.ROBLOX_VERIFY_CODE_PREFIX ?? 'TSBGC',
    apiUrl: 'https://users.roblox.com/v1',
    thumbApiUrl: 'https://thumbnails.roproxy.com/v1/users/avatar-headshot',
  },

  settings: {
    warEligibleDays: parseInt(process.env.WAR_ELIGIBLE_DAYS ?? '7', 10),
    minClanMembers: parseInt(process.env.MIN_CLAN_MEMBERS ?? '100', 10),
    leaderboardPageSize: 10,
    challengeRange: 10,
  },

  regions: Object.values(Region),
} as const;

export const ALL_STAFF_ROLES = [
  config.community.roles.competitiveSupervisor,
  config.community.roles.seniorAdmin,
  config.community.roles.admin,
  config.community.roles.juniorAdmin,
  config.community.roles.seniorSupport,
  config.community.roles.supportStaff,
  config.community.roles.trialSupport,
];

export const ADMIN_ROLES = [
  config.community.roles.competitiveSupervisor,
  config.community.roles.seniorAdmin,
  config.community.roles.admin,
];
