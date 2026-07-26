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

export function isWarManagerObserver(member: GuildMember): boolean {
  return member.roles.cache.has(config.war.roles.warManagerObserver);
}

export function isTsbccAdmin(member: GuildMember): boolean {
  return member.roles.cache.has(config.war.roles.tsbccAdmin);
}

export function isClanOwnerOrWMOrRL(member: GuildMember, clanOwnerId?: string, warManagerId?: string, regionLeadId?: string): boolean {
  return member.id === clanOwnerId || member.id === warManagerId || member.id === regionLeadId;
}
