import i18n from '../../i18n';
import { Valve, ValveAction, ValveCommand, ValveCommandStatus, ValveState } from './Valve';

/** Getters: the text follows the language active when it is read. */
export const VALVE_STATE_LABELS: Record<ValveState, string> = {
  get OPEN() {
    return i18n.t('valve.state.OPEN');
  },
  get CLOSED() {
    return i18n.t('valve.state.CLOSED');
  },
  get UNKNOWN() {
    return i18n.t('valve.state.UNKNOWN');
  },
};

export const ACTION_LABELS: Record<ValveAction, string> = {
  get OPEN() {
    return i18n.t('valve.action.OPEN');
  },
  get CLOSE() {
    return i18n.t('valve.action.CLOSE');
  },
};

export const STATUS_LABELS: Record<ValveCommandStatus, string> = {
  get SENT() {
    return i18n.t('valve.status.SENT');
  },
  get ACK_SUCCESS() {
    return i18n.t('valve.status.ACK_SUCCESS');
  },
  get ACK_TIMEOUT() {
    return i18n.t('valve.status.ACK_TIMEOUT');
  },
  get FAILED() {
    return i18n.t('valve.status.FAILED');
  },
};

export const COMMAND_POLL_MS = 2_000;
export const COMMAND_WAIT_MS = 40_000;

export const isFinished = (command: ValveCommand): boolean => command.status !== 'SENT';

export const outcomeMessage = (command: ValveCommand): { tone: 'success' | 'error'; text: string } => {
  switch (command.status) {
    case 'ACK_SUCCESS':
      return { tone: 'success', text: i18n.t(command.action === 'CLOSE' ? 'valve.outcome.closed' : 'valve.outcome.opened') };
    case 'ACK_TIMEOUT':
      return {
        tone: 'error',
        text: i18n.t('valve.outcome.timeout'),
      };
    case 'FAILED':
      return { tone: 'error', text: i18n.t('valve.outcome.failed') };
    default:
      return { tone: 'success', text: i18n.t('valve.outcome.sent') };
  }
};

export interface ValveAvailability {
  canClose: boolean;
  canOpen: boolean;
  reason: string | null;
}

export const availability = (valve: Valve): ValveAvailability => {
  if (valve.pendingCommand) {
    return { canClose: false, canOpen: false, reason: i18n.t('valve.availability.pending') };
  }
  if (valve.communication === 'NO_COMMUNICATION') {
    return {
      canClose: false,
      canOpen: true,
      reason: i18n.t('valve.availability.noComm'),
    };
  }
  return { canClose: valve.state !== 'CLOSED', canOpen: valve.state !== 'OPEN', reason: null };
};

export const describeRequester = (command: ValveCommand): string => {
  if (command.origin === 'AUTO_LEAK') return i18n.t('valve.requester.autoLeak');
  return command.requestedByName ?? i18n.t('valve.requester.you');
};
