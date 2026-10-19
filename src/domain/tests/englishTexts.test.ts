import { changeLanguage } from '../../i18n';
import { bucketLabel, formatFlow, formatVolume, PERIOD_LABELS, PERIOD_TITLES } from '../consumption/consumptionFormat';
import { DEVICE_STATUS_HINTS, DEVICE_STATUS_LABELS, formatLastReport } from '../devices/deviceStatus';
import { formatCatalogDate, formatMoney, sourceLabel, validateManualTariff } from '../tariffs/Tariff';

// HU-073: the domain texts and formats follow the active language
describe('domain texts in English', () => {
  beforeEach(async () => {
    await changeLanguage('en');
  });

  it('meter status and advice', () => {
    expect(DEVICE_STATUS_LABELS.NEVER_REPORTED).toBe('Never reported');
    expect(DEVICE_STATUS_HINTS.DISCONNECTED).toMatch(/Wi-Fi/);
    expect(DEVICE_STATUS_HINTS.CONNECTED).toBeNull();
  });

  it('last report phrases', () => {
    const now = new Date('2026-09-28T15:00:00Z');
    expect(formatLastReport(null, now)).toBe('No reports yet');
    expect(formatLastReport('2026-09-28T14:48:00Z', now)).toBe('12 min ago');
    expect(formatLastReport('2026-09-27T12:00:00Z', now)).toBe('1 day ago');
    expect(formatLastReport('2026-09-23T15:00:00Z', now)).toBe('5 days ago');
  });

  it('periods, flow and week days', () => {
    expect(PERIOD_LABELS.DAY).toBe('Today');
    expect(PERIOD_TITLES.WEEK).toBe('Last 7 days');
    expect(formatFlow(0)).toBe('No flow');
    expect(formatFlow(2.44)).toBe('2.4 L/min');
    expect(bucketLabel({ start: new Date(2026, 9, 3).toISOString(), liters: 1 }, 'WEEK')).toBe('Sat');
  });

  it('numbers use the English separators', () => {
    expect(formatVolume(12345)).toBe('12,345 L');
    expect(formatMoney(162800, 'COP')).toBe('$ 162,800');
    expect(formatMoney(12.5, 'USD')).toBe('US$ 12.50');
  });

  it('tariff texts and dates', () => {
    expect(sourceLabel('MANUAL', null)).toBe('Entered by you');
    expect(sourceLabel('CATALOG', 3)).toBe('Preloaded for your city · stratum 3');
    expect(formatCatalogDate('2026-01-01')).toBe('January 1, 2026');
    expect(validateManualTariff({ price: '', fixedCharge: '' }).errors.price).toBe('Enter the price per cubic meter from your bill.');
  });
});

describe('domain texts in Spanish keep working', () => {
  it('money and dates', () => {
    expect(formatMoney(162800, 'COP')).toBe('$ 162.800');
    expect(formatCatalogDate('2026-01-01')).toBe('1 de enero de 2026');
  });
});
