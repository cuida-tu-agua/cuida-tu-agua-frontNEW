import { MeasurementUnit } from '../places/Place';
import { ConsumptionBucket, ConsumptionPeriod } from './Consumption';

export const PERIOD_LABELS: Record<ConsumptionPeriod, string> = {
  DAY: 'Hoy',
  WEEK: 'Semana',
  MONTH: 'Mes',
};

export const PERIOD_TITLES: Record<ConsumptionPeriod, string> = {
  DAY: 'Consumo de hoy',
  WEEK: 'Últimos 7 días',
  MONTH: 'Este mes',
};

const LITERS_PER_UNIT: Record<MeasurementUnit, number> = {
  LITERS: 1,
  CUBIC_METERS: 1000,
  GALLONS: 3.785411784,
};

const UNIT_SYMBOL: Record<MeasurementUnit, string> = {
  LITERS: 'L',
  CUBIC_METERS: 'm³',
  GALLONS: 'gal',
};

export const toUnit = (liters: number, unit: MeasurementUnit): number => liters / LITERS_PER_UNIT[unit];

export const formatVolume = (liters: number, unit: MeasurementUnit = 'LITERS'): string => {
  const value = toUnit(liters, unit);
  const digits = unit === 'CUBIC_METERS' ? 3 : value < 10 ? 2 : value < 100 ? 1 : 0;
  return `${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: digits })} ${UNIT_SYMBOL[unit]}`;
};

export const formatFlow = (lpm: number | null): string =>
  lpm === null || lpm < 0.05
    ? 'Sin flujo'
    : `${lpm.toLocaleString('es-CO', { maximumFractionDigits: 1 })} L/min`;

const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

export const bucketLabel = (bucket: ConsumptionBucket, period: ConsumptionPeriod): string => {
  const date = new Date(bucket.start);
  if (period === 'DAY') return `${date.getHours()}h`;
  if (period === 'WEEK') return WEEKDAYS[date.getDay()];
  return String(date.getDate());
};

export const shouldLabel = (index: number, count: number, period: ConsumptionPeriod): boolean => {
  if (period === 'WEEK' || count <= 8) return true;
  const every = period === 'DAY' ? 6 : 5;
  return index % every === 0 || index === count - 1;
};

export const maxLiters = (buckets: ConsumptionBucket[]): number =>
  Math.max(0.001, ...buckets.map((b) => b.liters));

export const deviceTimeZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota';
  } catch {
    return 'America/Bogota';
  }
};
