import { Alert } from './Alert';

/** HU-033. Origins of the ValveClosed event in the docs (02-domain/domain-events.md, topic valve.closed). */
export type ValveClosedOrigin = 'MANUAL' | 'AUTO_LEAK' | 'AUTO_GOAL';

const ORIGIN_TEXT: Record<ValveClosedOrigin, string> = {
  MANUAL: 'Cerrada por el usuario',
  AUTO_LEAK: 'Cierre automático por fuga',
  AUTO_GOAL: 'Cierre automático por meta superada',
};

const isKnownOrigin = (value: unknown): value is ValveClosedOrigin =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(ORIGIN_TEXT, value);

/**
 * HU-033: "indicates the origin (user who executed it, or automatic rule that triggered it)".
 * Reads metadata.origin of a VALVE_CLOSED alert. Returns null for any other alert type, or when the
 * backend sent no origin or one we do not know, so the row simply does not show that line.
 */
export const valveClosedOriginText = (alert: Alert): string | null => {
  if (alert.alertType !== 'VALVE_CLOSED') return null;
  const origin = alert.metadata?.origin;
  return isKnownOrigin(origin) ? ORIGIN_TEXT[origin] : null;
};
