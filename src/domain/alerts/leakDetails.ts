import { formatVolume } from '../consumption/consumptionFormat';
import { Alert } from './Alert';

/**
 * HU-029. Payload of the LeakSuspected event in the docs (02-domain/domain-events.md):
 * detectedAt, durationMinutes, volumeConsumed, isNighttime and unit. All of it arrives in alert.metadata.
 */
export interface LeakDetails {
  /** ISO date from which the leak was detected. */
  detectedAt: string | null;
  durationMinutes: number | null;
  /** Water consumed during the leak, already converted to liters. */
  volumeLiters: number | null;
  /** The docs give nighttime consumption more weight, so the UI flags it. */
  isNighttime: boolean;
}

const LITERS_PER_UNIT: Record<string, number> = { LITERS: 1, CUBIC_METERS: 1000, GALLONS: 3.785411784 };

const asNumber = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null);

/** Reads the leak data of a SUSPECTED_LEAK alert. Null for any other alert type. Never throws on odd payloads. */
export const leakDetails = (alert: Alert): LeakDetails | null => {
  if (alert.alertType !== 'SUSPECTED_LEAK') return null;
  const m = alert.metadata ?? {};

  const detectedAt = typeof m.detectedAt === 'string' && !Number.isNaN(new Date(m.detectedAt).getTime()) ? m.detectedAt : null;
  const volume = asNumber(m.volumeConsumed);
  const unit = typeof m.unit === 'string' ? m.unit : 'LITERS';
  const factor = LITERS_PER_UNIT[unit];

  return {
    detectedAt,
    durationMinutes: asNumber(m.durationMinutes),
    volumeLiters: volume !== null && factor !== undefined ? volume * factor : null,
    isNighttime: m.isNighttime === true,
  };
};

const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });

/** "Desde las 3:10 a. m. · 35 min · 120,5 L": only the parts the backend sent. Null when there is nothing to show. */
export const leakSummaryText = (details: LeakDetails): string | null => {
  const parts: string[] = [];
  if (details.detectedAt) parts.push(`Desde las ${formatTime(details.detectedAt)}`);
  if (details.durationMinutes !== null) parts.push(`${Math.round(details.durationMinutes)} min`);
  if (details.volumeLiters !== null) parts.push(formatVolume(details.volumeLiters));
  return parts.length > 0 ? parts.join(' · ') : null;
};
