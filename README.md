# TSBCC Bot

The Strongest Battlegrounds Clanning Community Bot — a clan leaderboard and war management Discord bot.

## Features

- **Clan Verification** — code-based verification, 100+ member check, mod approval
- **Mainer System** — `/mainclan`, `/unmain`, `/removemember`, `/mycode`, `/codereset`
- **War Manager & Region Lead** — assign/remove via interactive tickets, self-resign
- **Challenge System** — 10-spot rule, auto-created ticket channels, auto-pull participants
- **Scorematch** — 18+ parameters, War Manager Observer approval flow
- **Leaderboards** — per-region (EU/AS/NA/SA/OCE), 10 clans per embed, in-place editing
- **Roblox Verification** — bio-based code verification
- **Warning/Strike System** — check, clear, remove warns and strikes
- **Quota Tracking** — leaderboard + per-user stats
- **Admin Tools** — `/call`, `/say`, `/brutal`, `/ocw`, `/refresh`

## Setup

```bash
npm install
cp .env.example .env
# Fill in .env with your IDs
npm run dev
```

## Architecture

- **Community Server** — leaderboards, announcements, clan management, Roblox verify
- **War Management Server** — challenges, tickets, score approval, CWM panels
- **Clan Servers** — bot joins temporarily for verification, then leaves

## Tech

- discord.js v14, TypeScript (ESM), MongoDB (Mongoose)
