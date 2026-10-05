export type ValveState = 'OPEN' | 'CLOSED' | 'UNKNOWN';
export type ValveCommunication = 'OK' | 'NO_COMMUNICATION';
export type ValveAction = 'OPEN' | 'CLOSE';
export type ValveCommandStatus = 'SENT' | 'ACK_SUCCESS' | 'ACK_TIMEOUT' | 'FAILED';
export type ValveCommandOrigin = 'MANUAL' | 'AUTO_LEAK';

export interface ValveCommand {
  id: string;
  action: ValveAction;
  status: ValveCommandStatus;
  origin: ValveCommandOrigin;
  requestedBy: string | null;
  requestedByName: string | null;
  createdAt: string;
  sentAt: string | null;
  timeoutAt: string;
  acknowledgedAt: string | null;
  failureReason: string | null;
}

export interface Valve {
  placeId: string;
  state: ValveState;
  communication: ValveCommunication;
  lastConfirmedAt: string | null;
  pendingCommand: ValveCommand | null;
}

export interface CodeSent {
  maskedEmail: string;
  expiresAt: string;
}
