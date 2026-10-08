/** HU-022: date-range filter of the valve action history. */

export type HistoryPreset = 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM';

export interface HistoryFilter {
  preset: HistoryPreset;
  /** Only used with CUSTOM: "yyyy-mm-dd" or "dd/mm/yyyy". */
  from: string;
  to: string;
}

export interface HistoryRange {
  /** ISO 8601 (UTC), inclusive. */
  from: string;
  to: string;
}

export type HistoryRangeResult = { ok: true; range: HistoryRange } | { ok: false; message: string };

/** Same window ms-valve applies when no dates are sent. */
export const DEFAULT_HISTORY_FILTER: HistoryFilter = { preset: 'MONTH', from: '', to: '' };

export const MAX_RANGE_DAYS = 366;

export const PRESET_OPTIONS: { value: HistoryPreset; label: string }[] = [
  { value: 'TODAY', label: 'Hoy' },
  { value: 'WEEK', label: '7 días' },
  { value: 'MONTH', label: '30 días' },
  { value: 'CUSTOM', label: 'Rango' },
];

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/** Reads "yyyy-mm-dd" or "dd/mm/yyyy" as a local calendar day; null when it is not a real date. */
export const parseDateInput = (text: string): Date | null => {
  const value = text.trim();
  let year: number;
  let month: number;
  let day: number;

  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);
  const latam = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
  if (iso) {
    [year, month, day] = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
  } else if (latam) {
    [day, month, year] = [Number(latam[1]), Number(latam[2]), Number(latam[3])];
  } else {
    return null;
  }

  const date = new Date(year, month - 1, day);
  const real = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return real ? date : null;
};

const fail = (message: string): HistoryRangeResult => ({ ok: false, message });

const ok = (from: Date, to: Date): HistoryRangeResult => ({
  ok: true,
  range: { from: from.toISOString(), to: to.toISOString() },
});

/** Turns the user's choice into the from/to the API takes, or says what is wrong with it. */
export const resolveHistoryRange = (filter: HistoryFilter, now: Date = new Date()): HistoryRangeResult => {
  switch (filter.preset) {
    case 'TODAY':
      return ok(startOfDay(now), now);
    case 'WEEK':
      return ok(addDays(startOfDay(now), -6), now);
    case 'MONTH':
      return ok(addDays(startOfDay(now), -29), now);
    case 'CUSTOM': {
      if (!filter.from.trim() || !filter.to.trim()) return fail('Escribe la fecha inicial y la final.');
      const from = parseDateInput(filter.from);
      const to = parseDateInput(filter.to);
      if (!from || !to) return fail('Usa el formato AAAA-MM-DD, por ejemplo 2026-10-01.');
      if (from > to) return fail('La fecha inicial no puede ser posterior a la final.');
      // The "to" day is included until its last millisecond.
      const end = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999);
      if ((end.getTime() - from.getTime()) / DAY_MS > MAX_RANGE_DAYS) return fail('El rango máximo es de un año.');
      return ok(from, end);
    }
  }
};

const formatDay = (text: string): string => {
  const date = parseDateInput(text);
  return date ? date.toLocaleDateString('es-CO', { dateStyle: 'medium' }) : text;
};

/** Short caption shown above the list. */
export const describeFilter = (filter: HistoryFilter): string => {
  switch (filter.preset) {
    case 'TODAY':
      return 'Hoy';
    case 'WEEK':
      return 'Últimos 7 días';
    case 'MONTH':
      return 'Últimos 30 días';
    case 'CUSTOM':
      return `Del ${formatDay(filter.from)} al ${formatDay(filter.to)}`;
  }
};
