import { MeasurementUnit } from '../places/Place';
import { Consumption, ConsumptionPeriod } from './Consumption';
import { toUnit } from './consumptionFormat';

/**
 * HU-038. Excel-friendly CSV of the consumption of one place.
 * - One row per interval: Fecha, Hora, Consumo, Unidad (hourly rows for "Hoy", daily rows for week and month).
 * - Delimiter ";" and decimal comma: what Excel expects in Spanish (Colombia). A leading BOM keeps the accents.
 * - Date as yyyy-mm-dd and time as HH:mm, in the time zone of the place's data.
 */
const UNIT_NAMES: Record<MeasurementUnit, string> = { LITERS: 'Litros', CUBIC_METERS: 'Metros cúbicos', GALLONS: 'Galones' };
const HEADER = ['Fecha', 'Hora', 'Consumo', 'Unidad'];
const BOM = '﻿';

const pad = (n: number) => String(n).padStart(2, '0');

const parts = (iso: string, timeZone: string) => {
  const get = (options: Intl.DateTimeFormatOptions) =>
    Object.fromEntries(
      new Intl.DateTimeFormat('en-CA', { timeZone, hourCycle: 'h23', ...options })
        .formatToParts(new Date(iso))
        .map((p) => [p.type, p.value]),
    );
  const p = get({ year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${pad(Number(p.hour))}:${p.minute}` };
};

/** Quotes a cell only when it needs it (delimiter, quote or line break inside). */
export const csvCell = (value: string): string => (/[;"\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/** 120.5 -> "120,5". Up to 3 decimals, no thousands separator (Excel adds its own). */
const formatNumber = (value: number): string => String(Math.round(value * 1000) / 1000).replace('.', ',');

export const buildConsumptionCsv = (consumption: Consumption, unit: MeasurementUnit): string => {
  const rows = consumption.buckets.map((bucket) => {
    const { date, time } = parts(bucket.start, consumption.timeZone);
    return [date, time, formatNumber(toUnit(bucket.liters, unit)), UNIT_NAMES[unit]].map(csvCell).join(';');
  });
  return BOM + [HEADER.join(';'), ...rows].join('\r\n') + '\r\n';
};

const PERIOD_FILE_NAMES: Record<ConsumptionPeriod, string> = { DAY: 'dia', WEEK: 'semana', MONTH: 'mes' };

/** "consumo-casa-semana-2026-10-07.csv": no accents, spaces or symbols, so it works in any file system. */
export const consumptionCsvFileName = (placeName: string, period: ConsumptionPeriod, now: Date = new Date()): string => {
  const slug =
    placeName
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'lugar';
  return `consumo-${slug}-${PERIOD_FILE_NAMES[period]}-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.csv`;
};
