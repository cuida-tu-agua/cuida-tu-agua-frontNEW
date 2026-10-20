import { MeasurementUnit } from '../places/Place';
import { toLiters, toUnit } from '../consumption/consumptionFormat';

/** HU-024: the color of the goal bar changes at 80 % (WARNING) and at 100 % (EXCEEDED). */
export type GoalStatus = 'ON_TRACK' | 'WARNING' | 'EXCEEDED';

/** What ms-consumption answers for the current local month of a place (HU-023/024). Everything in liters. */
export interface GoalProgress {
  placeId: string;
  timeZone: string;
  /** "2026-10-01": first day of the month. */
  monthStart: string;
  daysInMonth: number;
  /** Today included. */
  daysLeft: number;
  consumedLiters: number;
  hasGoal: boolean;
  targetLiters: number | null;
  /** Truncated to 1 decimal; can pass 100. */
  percentage: number | null;
  remainingLiters: number | null;
  status: GoalStatus | null;
  updatedAt: string | null;
}

/** Same limit as the service: 10,000 m³ in a month only happens by a typing mistake. */
export const MAX_GOAL_LITERS = 10_000_000;

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  ON_TRACK: 'Vas bien',
  WARNING: 'Cerca de la meta',
  EXCEEDED: 'Meta superada',
};

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** "2026-10-01" → "octubre". Read from the text, not with Date: a date-only string would move to the previous day in UTC-5. */
export const monthName = (monthStart: string): string => MONTHS[Number(monthStart.slice(5, 7)) - 1] ?? '';

export const daysLeftLabel = (days: number): string => (days === 1 ? 'Queda 1 día del mes' : `Quedan ${days} días del mes`);

/** Width of the bar: 0..1 (an exceeded goal fills it, the number says by how much). */
export const progressFraction = (percentage: number | null): number =>
  percentage === null ? 0 : Math.min(Math.max(percentage / 100, 0), 1);

/** Liters above the goal (0 while under it). */
export const overLiters = (goal: GoalProgress): number =>
  goal.targetLiters === null ? 0 : Math.max(goal.consumedLiters - goal.targetLiters, 0);

/**
 * What the user typed → number, or null. A comma is the decimal mark ("12,5"); a dot followed by groups of exactly 3
 * digits and starting with 1-9 groups thousands as on the bill ("12.000"); any other dot is a decimal mark ("0.75", "12.5").
 */
export const parseVolumeInput = (text: string): number | null => {
  const clean = text.replace(/\s/g, '');
  if (!clean || !/^[\d.,]+$/.test(clean)) return null;

  let normalized: string;
  if (clean.includes(',')) normalized = clean.replace(/\./g, '').replace(',', '.');
  else if (/^[1-9]\d{0,2}(\.\d{3})+$/.test(clean)) normalized = clean.replace(/\./g, '');
  else normalized = clean;

  if ((normalized.match(/\./g) ?? []).length > 1 || normalized.endsWith('.')) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
};

export interface GoalInputValidation {
  error: string | null;
  liters: number | null;
}

/** HU-023: the goal is typed in the unit of the place and sent in liters (> 0 and up to MAX_GOAL_LITERS). */
export const validateGoalInput = (text: string, unit: MeasurementUnit): GoalInputValidation => {
  if (!text.trim()) return { error: 'Escribe cuánta agua quieres gastar este mes.', liters: null };
  const value = parseVolumeInput(text);
  if (value === null) return { error: 'Escribe solo números, por ejemplo 12 o 12,5.', liters: null };
  const liters = Math.round(toLiters(value, unit) * 1000) / 1000;
  if (liters <= 0) return { error: 'La meta debe ser mayor que cero.', liters: null };
  if (liters > MAX_GOAL_LITERS) return { error: 'Esa meta es demasiado alta. Revisa el número.', liters: null };
  return { error: null, liters };
};

/** The goal shown again in the field when editing it: in the unit of the place, without thousand separators. */
export const goalInputValue = (liters: number, unit: MeasurementUnit): string => {
  const value = toUnit(liters, unit);
  return String(Math.round(value * 1000) / 1000).replace('.', ',');
};
