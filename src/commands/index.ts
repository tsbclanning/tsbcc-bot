import type { Command } from './interface.js';
import { clanverifyCommand } from './clan/clanverify.js';
import { addserveridCommand } from './clan/addserverid.js';
import { changeownerCommand } from './clan/changeowner.js';
import { renameclanCommand } from './clan/renameclan.js';
import { removeclanCommand } from './clan/removeclan.js';
import { clanlinkaddCommand } from './clan/clanlinkadd.js';
import { clanlinkremoveCommand } from './clan/clanlinkremove.js';
import { clanmainsCommand } from './clan/clanmains.js';
import { brutalCommand } from './clan/brutal.js';
import { ocwCommand } from './clan/ocw.js';
import { mainclanCommand } from './mainer/mainclan.js';
import { unmainCommand } from './mainer/unmain.js';
import { addmainerCommand } from './mainer/addmainer.js';
import { removememberCommand } from './mainer/removemember.js';
import { mycodeCommand } from './mainer/mycode.js';
import { coderesetCommand } from './mainer/codereset.js';
import { myclanmainersCommand } from './mainer/myclanmainers.js';
import { myclansmainsCommand } from './mainer/myclansmains.js';
import { wareligibleCommand as checkCommand } from './mainer/wareligible.js';
import { scorematchCommand } from './war/scorematch.js';
import { refreshCommand } from './war/refresh.js';
import { checkwarnsCommand } from './moderation/checkwarns.js';
import { clearwarnsCommand } from './moderation/clearwarns.js';
import { removestrikeCommand } from './moderation/removestrike.js';
import { removewarnCommand } from './moderation/removewarn.js';
import { requestCommand } from './moderation/request.js';

import { quotaLeaderboardCommand } from './quota/leaderboard.js';
import { quotaUserCommand } from './quota/user.js';
import { robloxVerifyCommand } from './roblox/verify.js';
import { robloxUnverifyCommand } from './roblox/unverify.js';
import { robloxForceverifyCommand } from './roblox/forceverify.js';
import { robloxForceunverifyCommand } from './roblox/forceunverify.js';
import { robloxWhoisCommand } from './roblox/whois.js';
import { callCommand } from './admin/call.js';
import { sayCommand } from './admin/say.js';

export const commands: Command[] = [
  // Clan
  clanverifyCommand,
  addserveridCommand,
  changeownerCommand,
  renameclanCommand,
  removeclanCommand,
  clanlinkaddCommand,
  clanlinkremoveCommand,
  clanmainsCommand,
  brutalCommand,
  ocwCommand,

  // Mainer
  mainclanCommand,
  unmainCommand,
  addmainerCommand,
  removememberCommand,
  mycodeCommand,
  coderesetCommand,
  myclanmainersCommand,
  myclansmainsCommand,
  checkCommand,

  // War
  scorematchCommand,
  refreshCommand,

  // Moderation
  checkwarnsCommand,
  clearwarnsCommand,
  removestrikeCommand,
  removewarnCommand,
  requestCommand,

  // Quota
  quotaLeaderboardCommand,
  quotaUserCommand,

  // Roblox
  robloxVerifyCommand,
  robloxUnverifyCommand,
  robloxForceverifyCommand,
  robloxForceunverifyCommand,
  robloxWhoisCommand,

  // Admin
  callCommand,
  sayCommand,
];
