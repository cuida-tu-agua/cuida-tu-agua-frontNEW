import { changeLanguage } from '../../../i18n';
import { ACTION_LABELS, LINK_FILTERS, STATUS_FILTERS as DEVICE_FILTERS, badgeOf, parseCount } from '../AdminDevices';
import { AdminUser, Page, STATUS_FILTERS, STATUS_LABELS, rangeLabel, roleLabel, unavailableLabels } from '../Admin';

const page = (totalItems: number, count: number, pageNumber = 0): Page<AdminUser> => ({
  items: Array.from({ length: count }, () => ({}) as AdminUser),
  page: pageNumber,
  size: 20,
  totalItems,
  totalPages: Math.ceil(totalItems / 20),
});

describe('admin texts in English (HU-078)', () => {
  beforeEach(async () => { await changeLanguage('en'); });

  it('roles, statuses and filters', () => {
    expect(roleLabel(['USER', 'ADMIN'])).toBe('Administrator');
    expect(roleLabel(['USER'])).toBe('User');
    expect(STATUS_LABELS.BLOCKED).toBe('Blocked');
    expect(STATUS_FILTERS.map((f) => f.label)).toEqual(['All', 'Active', 'Blocked', 'Unverified']);
    expect(DEVICE_FILTERS.map((f) => f.label)).toEqual(['All', 'Connected', 'Disconnected', 'Never reported', 'Decommissioned']);
    expect(LINK_FILTERS.map((f) => f.label)).toEqual(['Linked and free', 'Linked', 'Free']);
  });

  it('page ranges and empty results', () => {
    expect(rangeLabel(page(54, 20, 1))).toBe('21–40 of 54');
    expect(rangeLabel(page(0, 0))).toBe('0 results');
  });

  it('sections that did not answer', () => {
    expect(unavailableLabels(['devices', 'places', 'other'])).toEqual(['Devices', 'Places', 'other']);
  });

  it('device badges, log actions and the batch size error', () => {
    expect(badgeOf({ status: 'CONNECTED', decommissioned: true }).label).toBe('Decommissioned');
    expect(badgeOf({ status: 'NEVER_REPORTED', decommissioned: false }).label).toBe('Never reported');
    expect(ACTION_LABELS.CREDENTIALS_REGENERATED).toBe('New credentials');
    const result = parseCount('abc');
    expect(result.ok ? '' : result.error).toBe('Enter a whole number from 1 to 50.');
  });

  it('the labels follow a language change made after the module was loaded', async () => {
    await changeLanguage('es');
    expect(STATUS_FILTERS[1].label).toBe('Activas');
    await changeLanguage('en');
    expect(STATUS_FILTERS[1].label).toBe('Active');
  });
});
