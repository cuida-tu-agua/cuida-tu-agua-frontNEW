import { Valve, ValveAction, ValveCommand, ValveCommandStatus, ValveState } from './Valve';

export const VALVE_STATE_LABELS: Record<ValveState, string> = {
  OPEN: 'Abierta',
  CLOSED: 'Cerrada',
  UNKNOWN: 'Desconocido',
};

export const ACTION_LABELS: Record<ValveAction, string> = { OPEN: 'Abrir', CLOSE: 'Cerrar' };

export const STATUS_LABELS: Record<ValveCommandStatus, string> = {
  SENT: 'Esperando al medidor',
  ACK_SUCCESS: 'Confirmada',
  ACK_TIMEOUT: 'Sin respuesta',
  FAILED: 'Falló',
};

export const COMMAND_POLL_MS = 2_000;
export const COMMAND_WAIT_MS = 40_000;

export const isFinished = (command: ValveCommand): boolean => command.status !== 'SENT';

export const outcomeMessage = (command: ValveCommand): { tone: 'success' | 'error'; text: string } => {
  const verb = command.action === 'CLOSE' ? 'cerró' : 'abrió';
  switch (command.status) {
    case 'ACK_SUCCESS':
      return { tone: 'success', text: `El medidor confirmó: la válvula se ${verb}.` };
    case 'ACK_TIMEOUT':
      return {
        tone: 'error',
        text: 'El medidor no respondió en 30 segundos. La válvula sigue como estaba. Revisa su conexión e inténtalo de nuevo.',
      };
    case 'FAILED':
      return { tone: 'error', text: 'La orden no se pudo completar. La válvula sigue como estaba.' };
    default:
      return { tone: 'success', text: 'Orden enviada. Esperando confirmación del medidor…' };
  }
};

export interface ValveAvailability {
  canClose: boolean;
  canOpen: boolean;
  reason: string | null;
}

export const availability = (valve: Valve): ValveAvailability => {
  if (valve.pendingCommand) {
    return { canClose: false, canOpen: false, reason: 'Hay una orden en curso. Espera la confirmación del medidor.' };
  }
  if (valve.communication === 'NO_COMMUNICATION') {
    return {
      canClose: false,
      canOpen: true,
      reason: 'Sin comunicación con el medidor: el estado puede no estar actualizado y no se puede cerrar hasta que vuelva a reportar.',
    };
  }
  return { canClose: valve.state !== 'CLOSED', canOpen: valve.state !== 'OPEN', reason: null };
};

export const describeRequester = (command: ValveCommand): string => {
  if (command.origin === 'AUTO_LEAK') return 'Automático (posible fuga)';
  return command.requestedByName ?? 'Tú';
};
