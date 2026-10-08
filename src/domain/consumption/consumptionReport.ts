import { Consumption, ConsumptionBucket, ConsumptionPeriod } from './Consumption';

/** HU-057: what the consumption report of a period says. */
export interface ConsumptionReport {
  placeName: string;
  period: ConsumptionPeriod;
  /** "Del 2 al 8 de oct. de 2026" */
  rangeText: string;
  generatedAt: string;
  totalLiters: number;
  /** Total divided by the days that have already passed in the period. */
  dailyAverageLiters: number;
  elapsedDays: number;
  /** Hour (Hoy) or day (Semana, Mes) with the highest consumption; null if there was none. */
  peak: ConsumptionBucket | null;
  hasData: boolean;
  /** Data gaps found in the period, ready to show to the user. */
  warnings: string[];
}

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

/** The meter is considered silent after this long without a reading. */
export const STALE_READING_HOURS = 6;

const day = (date: Date): string => date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

/** Day(s) the report covers. `to` comes exclusive from the API, so the last day is the one before it ends. */
export const reportRangeText = (consumption: Pick<Consumption, 'from' | 'to' | 'period'>): string => {
  const from = new Date(consumption.from);
  const last = new Date(new Date(consumption.to).getTime() - 1);
  if (consumption.period === 'DAY' || from.toDateString() === last.toDateString()) return day(from);
  return `Del ${day(from)} al ${day(last)}`;
};

const elapsedBuckets = (consumption: Consumption, now: Date): ConsumptionBucket[] =>
  consumption.buckets.filter((b) => new Date(b.start).getTime() <= now.getTime());

/** Days (Semana, Mes) that already ended and have not a single liter. Today is never counted. */
const silentDays = (consumption: Consumption, now: Date): number =>
  consumption.buckets.filter((b) => new Date(b.start).getTime() + DAY_MS <= now.getTime() && b.liters === 0).length;

/**
 * HU-057 "warns if there are data gaps". ms-consumption fills the empty buckets with 0, so a missing
 * reading and a day without consumption look the same: the warning says it can be either one.
 */
export const reportWarnings = (consumption: Consumption, now: Date = new Date()): string[] => {
  if (!consumption.hasData) return ['No hay lecturas del medidor en este periodo, así que el reporte está vacío.'];

  const warnings: string[] = [];

  if (consumption.lastReadingAt) {
    const reference = Math.min(new Date(consumption.to).getTime(), now.getTime());
    const silentMs = reference - new Date(consumption.lastReadingAt).getTime();
    if (silentMs > STALE_READING_HOURS * HOUR_MS) {
      const since = new Date(consumption.lastReadingAt).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
      warnings.push(`El medidor no reporta desde el ${since}. Lo que ocurrió después no está en el reporte.`);
    }
  }

  if (consumption.period !== 'DAY') {
    const days = silentDays(consumption, now);
    if (days > 0) {
      warnings.push(
        `${days === 1 ? '1 día' : `${days} días`} sin consumo registrado: puede que no se haya usado agua o que falten lecturas.`,
      );
    }
  }

  return warnings;
};

export const buildConsumptionReport = (consumption: Consumption, placeName: string, now: Date = new Date()): ConsumptionReport => {
  const elapsed = elapsedBuckets(consumption, now);
  // Hoy is a single day; for Semana and Mes the days that have started (today counts) divide the total
  const elapsedDays = consumption.period === 'DAY' ? 1 : Math.max(1, elapsed.length);
  const peak = consumption.buckets.reduce<ConsumptionBucket | null>(
    (best, b) => (b.liters > (best?.liters ?? 0) ? b : best),
    null,
  );

  return {
    placeName,
    period: consumption.period,
    rangeText: reportRangeText(consumption),
    generatedAt: now.toISOString(),
    totalLiters: consumption.totalLiters,
    dailyAverageLiters: consumption.totalLiters / elapsedDays,
    elapsedDays,
    peak,
    hasData: consumption.hasData,
    warnings: reportWarnings(consumption, now),
  };
};
