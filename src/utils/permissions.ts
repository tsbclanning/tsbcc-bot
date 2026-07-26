import type { GuildMember } from 'discord.js';
import { config, ALL_STAFF_ROLES, ADMIN_ROLES } from '../config/index.js';

export function isStaff(member: GuildMember): boolean {
  return ALL_STAFF_ROLES.some((role) => member.roles.cache.has(role));
}

export function isAdmin(member: GuildMember): boolean {
  return ADMIN_ROLES.some((role) => member.roles.cache.has(role));
}

export function isCompetitiveSupervisor(member: GuildMember): boolean {
  return member.roles.cache.has(config.community.roles.competitiveSupervisor);
}

export function isBotOwner(userId: string): boolean {
  return userId === config.botOwnerId;
}

// ─── War Management Server Roles ───
export function isWarManagerObserver(member: GuildMember): boolean {
  return member.roles.cache.has(config.war.roles.warManagerObserver);
}

export function isTsbccAdmin(member: GuildMember): boolean {
  return member.roles.cache.has(config.war.roles.tsbccAdmin);
}

export function isTsbgOwner(member: GuildMember): boolean {
  return member.roles.cache.has(config.war.roles.tsbgOwner);
}

export function isWarManager(member: GuildMember): boolean {
  return member.roles.cache.has(config.war.roles.warManager) ||
    member.roles.cache.has(config.war.roles.clansWarManager) ||
    member.roles.cache.has(config.war.roles.trialWarManager);
}

export function isClanLeaderWM(member: GuildMember): boolean {
  return member.roles.cache.has(config.war.roles.clanLeader);
}

export function isRegionLeadWM(member: GuildMember): boolean {
  return member.roles.cache.has(config.war.roles.regionLead);
}

// ─── Community Server Roles ───
export function isClanLeader(member: GuildMember): boolean {
  return member.roles.cache.has(config.community.roles.clanLeader) ||
    member.roles.cache.has(config.community.roles.globalClanLeader);
}

export function isGlobalClanLeader(member: GuildMember): boolean {
  return member.roles.cache.has(config.community.roles.globalClanLeader);
}

export function isRegionLead(member: GuildMember): boolean {
  return member.roles.cache.has(config.community.roles.regionLead);
}

export function isWarManagerCommunity(member: GuildMember): boolean {
  return member.roles.cache.has(config.community.roles.experiencedWarManager) ||
    member.roles.cache.has(config.community.roles.trialWarManager) ||
    member.roles.cache.has(config.community.roles.warManagementTeam);
}

export function isLbManager(member: GuildMember): boolean {
  return member.roles.cache.has(config.community.roles.lbManager);
}

export function hasBlacklistPerms(member: GuildMember): boolean {
  return member.roles.cache.has(config.community.roles.blacklistPerms) || isAdmin(member);
}

// ─── Referee Roles ───
export function isReferee(member: GuildMember): boolean {
  return member.roles.cache.has(config.community.roles.experiencedReferee) ||
    member.roles.cache.has(config.community.roles.trialReferee);
}

export function isOnDutyReferee(member: GuildMember): boolean {
  return member.roles.cache.has(config.community.roles.onDutyReferee);
}

// ─── Combined Checks ───
export function canChallenge(member: GuildMember, clanOwnerId?: string, warManagerId?: string, regionLeadId?: string): boolean {
  return member.id === clanOwnerId || member.id === warManagerId || member.id === regionLeadId ||
    isClanLeader(member) || isWarManagerCommunity(member) || isRegionLead(member);
}

export function canManageClan(member: GuildMember, clanOwnerId?: string): boolean {
  return member.id === clanOwnerId || isClanLeader(member) || isAdmin(member);
}

export function canApproveScore(member: GuildMember): boolean {
  return isWarManagerObserver(member) || isTsbccAdmin(member);
}

export function canCloseTicket(member: GuildMember): boolean {
  return isTsbccAdmin(member) || isWarManagerObserver(member) || isWarManager(member) || isStaff(member);
}
