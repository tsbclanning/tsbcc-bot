import type { Interaction, ChatInputCommandInteraction, ButtonInteraction, ModalSubmitInteraction, StringSelectMenuInteraction, AutocompleteInteraction } from 'discord.js';
import { logger } from '../utils/logger.js';
import { commands } from '../commands/index.js';
import { handleOpenChallengeButton } from '../components/buttons/challenge.js';
import { handleAssignWM, handleAssignRL, handleRemoveWM, handleRemoveRL, handleResignWM, handleResignRL } from '../components/buttons/wmRl.js';
import { handleCloseTicketButton } from '../components/buttons/closeTicket.js';
import { handleApproveScore, handleDenyScore } from '../components/buttons/scoreApproval.js';
import { handleRobloxConfirmYes, handleRobloxConfirmNo, handleRobloxCheckCode } from '../components/buttons/robloxVerify.js';
import { handleGoToServerButton } from '../components/buttons/goToServer.js';
import { handleAcceptAssignment, handleDenyAssignment } from '../components/buttons/assignment.js';
import { handleApproveRename, handleDenyRename, handleApproveOwner, handleDenyOwner, handleApproveMerge, handleDenyMerge } from '../components/buttons/approvals.js';
import { handleClanManagementSelect } from '../components/selects/clanManagement.js';
import { handleChallengeFromSelect, handleChallengeTargetSelect } from '../components/selects/challenge.js';
import { handleAssignRegionSelect, handleAssignClanSelect, handleRemoveAssignmentSelect } from '../components/selects/wmRl.js';
import { handleRefreshRegionSelect } from '../components/selects/refresh.js';
import { handleRenameClanModal, handleSwitchOwnerModal, handleMergeClanModal } from '../components/modals/clanModals.js';
import { ButtonCustomId, ModalCustomId, SelectCustomId } from '../types/index.js';

export async function execute(interaction: Interaction): Promise<void> {
  if (interaction.isAutocomplete()) {
    await handleAutocomplete(interaction);
  } else if (interaction.isChatInputCommand()) {
    await handleSlashCommand(interaction);
  } else if (interaction.isButton()) {
    await handleButton(interaction);
  } else if (interaction.isModalSubmit()) {
    await handleModal(interaction);
  } else if (interaction.isStringSelectMenu()) {
    await handleSelectMenu(interaction);
  }
}

async function handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
  const command = commands.find((cmd) => cmd.data.name === interaction.commandName);
  if (!command?.autocomplete) return;
  await command.autocomplete(interaction);
}

async function handleSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  const command = commands.find((cmd) => cmd.data.name === interaction.commandName);
  if (!command) {
    await interaction.reply({ content: 'Unknown command.', ephemeral: true });
    return;
  }
  await command.execute(interaction);
}

async function handleButton(interaction: ButtonInteraction): Promise<void> {
  switch (interaction.customId) {
    case ButtonCustomId.OPEN_CHALLENGE:
      await handleOpenChallengeButton(interaction);
      break;
    case ButtonCustomId.ASSIGN_WM:
      await handleAssignWM(interaction);
      break;
    case ButtonCustomId.ASSIGN_RL:
      await handleAssignRL(interaction);
      break;
    case ButtonCustomId.REMOVE_WM:
      await handleRemoveWM(interaction);
      break;
    case ButtonCustomId.REMOVE_RL:
      await handleRemoveRL(interaction);
      break;
    case ButtonCustomId.RESIGN_WM:
      await handleResignWM(interaction);
      break;
    case ButtonCustomId.RESIGN_RL:
      await handleResignRL(interaction);
      break;
    case ButtonCustomId.CLOSE_TICKET:
      await handleCloseTicketButton(interaction);
      break;
    case ButtonCustomId.APPROVE_SCORE:
      await handleApproveScore(interaction);
      break;
    case ButtonCustomId.DENY_SCORE:
      await handleDenyScore(interaction);
      break;
    case ButtonCustomId.ROBLOX_CONFIRM_YES:
      await handleRobloxConfirmYes(interaction);
      break;
    case ButtonCustomId.ROBLOX_CONFIRM_NO:
      await handleRobloxConfirmNo(interaction);
      break;
    case ButtonCustomId.ROBLOX_CHECK_CODE:
      await handleRobloxCheckCode(interaction);
      break;
    case ButtonCustomId.GO_TO_SERVER:
      // Link button, no handler needed
      break;
    case ButtonCustomId.ACCEPT_ASSIGNMENT:
      await handleAcceptAssignment(interaction);
      break;
    case ButtonCustomId.DENY_ASSIGNMENT:
      await handleDenyAssignment(interaction);
      break;
    default:
      // Dynamic custom IDs (with :prefix)
      if (interaction.customId.startsWith('approve_rename:')) {
        await handleApproveRename(interaction);
      } else if (interaction.customId.startsWith('deny_rename:')) {
        await handleDenyRename(interaction);
      } else if (interaction.customId.startsWith('approve_owner:')) {
        await handleApproveOwner(interaction);
      } else if (interaction.customId.startsWith('deny_owner:')) {
        await handleDenyOwner(interaction);
      } else if (interaction.customId.startsWith('approve_merge:')) {
        await handleApproveMerge(interaction);
      } else if (interaction.customId.startsWith('deny_merge:')) {
        await handleDenyMerge(interaction);
      } else {
        logger.warn(`Unknown button customId: ${interaction.customId}`);
      }
  }
}

async function handleModal(interaction: ModalSubmitInteraction): Promise<void> {
  switch (interaction.customId) {
    case ModalCustomId.CLAN_RENAME:
      await handleRenameClanModal(interaction);
      break;
    case ModalCustomId.CLAN_OWNER:
      await handleSwitchOwnerModal(interaction);
      break;
    case ModalCustomId.CLAN_MERGE:
      await handleMergeClanModal(interaction);
      break;
    default:
      logger.warn(`Unknown modal customId: ${interaction.customId}`);
  }
}

async function handleSelectMenu(interaction: StringSelectMenuInteraction): Promise<void> {
  switch (interaction.customId) {
    case SelectCustomId.CLAN_MANAGEMENT:
      await handleClanManagementSelect(interaction);
      break;
    case SelectCustomId.CHALLENGE_FROM:
      await handleChallengeFromSelect(interaction);
      break;
    case SelectCustomId.CHALLENGE_TARGET:
      await handleChallengeTargetSelect(interaction);
      break;
    case SelectCustomId.ASSIGN_REGION:
      await handleAssignRegionSelect(interaction);
      break;
    case SelectCustomId.ASSIGN_CLAN:
      await handleAssignClanSelect(interaction);
      break;
    case SelectCustomId.REMOVE_ASSIGNMENT:
      await handleRemoveAssignmentSelect(interaction);
      break;
    case SelectCustomId.REFRESH_REGION:
      await handleRefreshRegionSelect(interaction);
      break;
    default:
      logger.warn(`Unknown select menu customId: ${interaction.customId}`);
  }
}
