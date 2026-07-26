import type { Client, EmbedBuilder, User } from 'discord.js';
import { config } from '../config/index.js';

export function clanNameToSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

export function generateMainerCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function generateRobloxVerifyCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${config.roblox.verifyCodePrefix}-${code}`;
}

export function generateTicketId(): string {
  return `tk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

export function generateClanId(): string {
  return `clan-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export async function getUserFromAnyGuild(client: Client, userId: string): Promise<User | null> {
  try {
    return await client.users.fetch(userId);
  } catch {
    return null;
  }
}
