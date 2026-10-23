import i18n from '../../i18n';
import { formatNumber, localeTag, numberMarks } from '../../i18n/format';
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

/** Getters: the text follows the language active when it is read. */
export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  get ON_TRACK() {
    return i18n.t('goals.status.ON_TRACK');
  },
  get WARNING() {
    return i18n.t('goals.status.WARNING');
  },
  get EXCEEDED() {
    return i18n.t('goals.status.EXCEEDED');
  },
};

/**
 * "2026-10-01" → "octubre" / "October" / "octobre" / "outubro". The year and month are read from the text and the date is
 * built at local noon of day 15: a date-only string parsed as UTC would move to the previous month in UTC-5.
 */
export const monthName = (monthStart: string): string => {
  const year = Number(monthStart.slice(0, 4));
  const month = Number(monthStart.slice(5, 7));
  if (!year || !month) return '';
  return new Date(year, month - 1, 15, 12).toLocaleDateString(localeTag(), { month: 'long' });
};

export const daysLeftLabel = (days: number): string => i18n.t('goals.daysLeft', { count: days });

/** "80 %" in Spanish, French and Portuguese, "80%" in English, with the decimal mark of the language. */
export const formatPercent = (value: number | null): string =>
  i18n.t('goals.percent', { value: formatNumber(value ?? 0, 1) });

/** Width of the bar: 0..1 (an exceeded goal fills it, the number says by how much). */
export const progressFraction = (percentage: number | null): number =>
  percentage === null ? 0 : Math.min(Math.max(percentage / 100, 0), 1);

/** Liters above the goal (0 while under it). */
export const overLiters = (goal: GoalProgress): number =>
  goal.targetLiters === null ? 0 : Math.max(goal.consumedLiters - goal.targetLiters, 0);

/**
 * What the user typed → number, or null, read with the marks of the current language.
 * Spanish, French, Portuguese: a comma is the decimal mark ("12,5"); a dot followed by groups of exactly 3 digits and
 * starting with 1-9 groups thousands as on the bill ("12.000"); any other dot is a decimal mark ("0.75", "12.5").
 * English: a dot is the decimal mark and a comma groups thousands ("12,000", "12.5").
 */
export const parseVolumeInput = (text: string): number | null => {
  const clean = text.replace(/\s/g, '');
  if (!clean || !/^[\d.,]+$/.test(clean)) return null;

  let normalized: string;
  if (localeTag().startsWith('en')) {
    if (clean.includes(',') && !/^[1-9]\d{0,2}(,\d{3})+(\.\d+)?$/.test(clean)) return null;
    normalized = clean.replace(/,/g, '');
  } else if (clean.includes(',')) {
    normalized = clean.replace(/\./g, '').replace(',', '.');
  } else if (/^[1-9]\d{0,2}(\.\d{3})+$/.test(clean)) {
    normalized = clean.replace(/\./g, '');
  } else {
    normalized = clean;
  }

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
  if (!text.trim()) return { error: i18n.t('goals.required'), liters: null };
  const value = parseVolumeInput(text);
  if (value === null) return { error: i18n.t('goals.notNumber'), liters: null };
  const liters = Math.round(toLiters(value, unit) * 1000) / 1000;
  if (liters <= 0) return { error: i18n.t('goals.positive'), liters: null };
  if (liters > MAX_GOAL_LITERS) return { error: i18n.t('goals.tooHigh'), liters: null };
  return { error: null, liters };
};

/** The goal shown again in the field when editing it: in the unit of the place, with the decimal mark of the language. */
export const goalInputValue = (liters: number, unit: MeasurementUnit): string => {
  const value = Math.round(toUnit(liters, unit) * 1000) / 1000;
  return String(value).replace('.', numberMarks().decimal);
};

/** The hint of the goal field, with the thousands mark of the language. */
export const goalPlaceholder = (unit: MeasurementUnit): string =>
  unit === 'CUBIC_METERS'
    ? i18n.t('goals.placeholderCubicMeters')
    : unit === 'GALLONS'
      ? i18n.t('goals.placeholderGallons')
      : i18n.t('goals.placeholderLiters');
