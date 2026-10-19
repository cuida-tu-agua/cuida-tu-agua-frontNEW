import { changeLanguage } from '../../i18n';
import { bucketLabel, formatFlow, formatVolume, PERIOD_LABELS, PERIOD_TITLES } from '../consumption/consumptionFormat';
import { CHANNEL_LABELS, SEVERITY_HINTS, SEVERITY_LABELS, timeAgo } from '../notifications/Notification';
import { CATEGORY_LABELS, validateTip } from '../tips/Tip';
import { navItemsFor } from '../../presentation/navigation/navItems';
import { validateLinkDeviceForm } from '../devices/linkDeviceForm';
import { ACTION_LABELS, availability, describeRequester, outcomeMessage, STATUS_LABELS, VALVE_STATE_LABELS } from '../valve/valveRules';
import { Valve, ValveCommand } from '../valve/Valve';
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

describe('device linking and valve texts in English (HU-074)', () => {
  beforeEach(async () => {
    await changeLanguage('en');
  });

  it('link form validation', () => {
    expect(validateLinkDeviceForm({ serialNumber: '', pairingCode: '' })).toEqual({
      serialNumber: 'Enter the serial number shown on the box.',
      pairingCode: 'Enter the pairing code.',
    });
    expect(validateLinkDeviceForm({ serialNumber: 'SW-ESP32-000001', pairingCode: 'ABCD-0EFG' }).pairingCode).toBe(
      'The code does not use 0, O, 1, I or L. Check the label.',
    );
  });

  it('valve labels and outcomes', () => {
    expect(VALVE_STATE_LABELS.CLOSED).toBe('Closed');
    expect(ACTION_LABELS.CLOSE).toBe('Close');
    expect(STATUS_LABELS.ACK_TIMEOUT).toBe('No response');
    const command = { action: 'CLOSE', status: 'ACK_SUCCESS' } as ValveCommand;
    expect(outcomeMessage(command).text).toBe('The meter confirmed: the valve closed.');
    expect(outcomeMessage({ ...command, action: 'OPEN' }).text).toBe('The meter confirmed: the valve opened.');
    expect(availability({ pendingCommand: {} } as unknown as Valve).reason).toBe('An order is in progress. Wait for the meter to confirm.');
    expect(describeRequester({ origin: 'AUTO_LEAK' } as ValveCommand)).toBe('Automatic (possible leak)');
    expect(describeRequester({ origin: 'USER', requestedByName: null } as unknown as ValveCommand)).toBe('You');
  });
});

describe('notification, tip and menu texts in English (HU-075)', () => {
  beforeEach(async () => {
    await changeLanguage('en');
  });

  it('notification labels and relative times', () => {
    const now = new Date('2026-10-19T12:00:00Z');
    expect(SEVERITY_LABELS.CRITICAL).toBe('Critical');
    expect(SEVERITY_HINTS.WARNING).toMatch(/disconnected meter/);
    expect(CHANNEL_LABELS.push).toBe('Phone notification');
    expect(timeAgo('2026-10-19T11:59:50Z', now)).toBe('now');
    expect(timeAgo('2026-10-19T11:55:00Z', now)).toBe('5 min ago');
    expect(timeAgo('2026-10-18T11:00:00Z', now)).toBe('yesterday');
    expect(timeAgo('2026-10-15T12:00:00Z', now)).toBe('4 days ago');
    expect(timeAgo('2026-09-01T12:00:00Z', now)).toMatch(/Sep 1, 2026/);
  });

  it('tip categories and validation', () => {
    expect(CATEGORY_LABELS.COMMERCIAL).toBe('Commercial');
    expect(validateTip({ title: '', body: '', category: null }).errors).toEqual({
      title: 'Enter a title.',
      body: 'Enter the tip.',
      category: 'Choose which type of place it is for.',
    });
  });

  it('menu items follow the language', async () => {
    expect(navItemsFor(['USER']).map((i) => i.label)).toEqual(['My places', 'Notifications', 'Favorite tips', 'My profile']);
    await changeLanguage('es');
    expect(navItemsFor(['USER']).map((i) => i.label)).toEqual(['Mis lugares', 'Notificaciones', 'Consejos favoritos', 'Mi perfil']);
  });
});

describe('domain texts in Spanish keep working', () => {
  it('money and dates', () => {
    expect(formatMoney(162800, 'COP')).toBe('$ 162.800');
    expect(formatCatalogDate('2026-01-01')).toBe('1 de enero de 2026');
  });
});
