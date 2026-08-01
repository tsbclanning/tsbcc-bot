export enum Region {
  EU = 'EU',
  AS = 'AS',
  NA = 'NA',
  SA = 'SA',
  OCE = 'OCE',
}

export enum ClanStatus {
  ACTIVE = 'ACTIVE',
  BLACKLISTED = 'BLACKLISTED',
  DISBANDED = 'DISBANDED',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum TicketType {
  CHALLENGE = 'CHALLENGE',
  WM_ASSIGN = 'WM_ASSIGN',
  RL_ASSIGN = 'RL_ASSIGN',
  CLAN_RENAME = 'CLAN_RENAME',
  CLAN_OWNER = 'CLAN_OWNER',
  CLAN_MERGE = 'CLAN_MERGE',
  CLAN_EXPAND = 'CLAN_EXPAND',
  CLAN_VERIFY = 'CLAN_VERIFY',
  GENERAL = 'GENERAL',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
}

export enum WarningType {
  WARNING = 'WARNING',
  STRIKE = 'STRIKE',
}

export const REGIONS = Object.values(Region);

export const ButtonCustomId = {
  OPEN_CHALLENGE: 'btn_open_challenge',
  ASSIGN_WM: 'btn_assign_wm',
  ASSIGN_RL: 'btn_assign_rl',
  REMOVE_WM: 'btn_remove_wm',
  REMOVE_RL: 'btn_remove_rl',
  RESIGN_WM: 'btn_resign_wm',
  RESIGN_RL: 'btn_resign_rl',
  CLOSE_TICKET: 'btn_close_ticket',
  APPROVE_SCORE: 'btn_approve_score',
  DENY_SCORE: 'btn_deny_score',
  GO_TO_SERVER: 'btn_go_to_server',
  ROBLOX_CONFIRM_YES: 'btn_roblox_yes',
  ROBLOX_CONFIRM_NO: 'btn_roblox_no',
  ROBLOX_CHECK_CODE: 'btn_roblox_check',
  ACCEPT_ASSIGNMENT: 'btn_accept_assignment',
  DENY_ASSIGNMENT: 'btn_deny_assignment',
  APPROVE_RENAME: 'btn_approve_rename',
  DENY_RENAME: 'btn_deny_rename',
  APPROVE_OWNER: 'btn_approve_owner',
  DENY_OWNER: 'btn_deny_owner',
  APPLY_CLAN_VERIFY: 'btn_apply_clan_verify',
  CLAIM_CLAN_LEADER: 'btn_claim_clan_leader',
  WELCOME_RULES: 'btn_welcome_rules',
  WELCOME_BRANCHES: 'btn_welcome_branches',
  WELCOME_CREATE_CLAN: 'btn_welcome_create_clan',
  WELCOME_SUPPORT: 'btn_welcome_support',
} as const;

export const ModalCustomId = {
  ROBLOX_VERIFY: 'modal_roblox_verify',
  CLAN_RENAME: 'modal_clan_rename',
  CLAN_OWNER: 'modal_clan_owner',
  CLAN_MERGE: 'modal_clan_merge',
} as const;

export const SelectCustomId = {
  CLAN_MANAGEMENT: 'select_clan_management',
  CHALLENGE_FROM: 'select_challenge_from',
  CHALLENGE_TARGET: 'select_challenge_target',
  ASSIGN_REGION: 'select_assign_region',
  ASSIGN_CLAN: 'select_assign_clan',
  REMOVE_ASSIGNMENT: 'select_remove_assignment',
  REFRESH_REGION: 'select_refresh_region',
} as const;

export const ModalInputCustomId = {
  ROBLOX_USERNAME: 'input_roblox_username',
  CLAN_NAME: 'input_clan_name',
  NEW_OWNER_ID: 'input_new_owner_id',
  MERGE_TARGET_ID: 'input_merge_target_id',
  REGION_SELECT: 'input_region',
} as const;

export interface RegionData {
  region: Region;
  rank: number;
  warManager: string | null;
  regionLead: string | null;
}

export interface ScoreMatchData {
  winnerId: string;
  loserId: string;
  region: Region;
  score?: string;
  referee?: string;
  referee2?: string;
  autoWin: boolean;
  proof?: string;
  mvp?: string;
  subScores?: Record<string, string>;
}
