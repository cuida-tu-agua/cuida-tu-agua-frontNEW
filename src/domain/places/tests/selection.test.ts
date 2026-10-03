import { Place } from '../Place';
import { markSelected, selectedPlace } from '../selection';

const place = (id: string, isDefault: boolean): Place => ({
  id,
  name: id,
  type: 'RESIDENTIAL',
  address: 'Calle 1',
  cityId: 'c',
  cityName: 'Bogotá',
  subdivisionId: 's',
  subdivisionName: 'Bogotá, D.C.',
  countryCode: 'CO',
  countryName: 'Colombia',
  currency: 'COP',
  measurementUnit: 'LITERS',
  isDefault,
  createdAt: '2026-09-29T12:00:00Z',
  updatedAt: '2026-09-29T12:00:00Z',
});

describe('markSelected (HU-010)', () => {
  it('moves the mark and keeps the order of the list', () => {
    const result = markSelected([place('casa', true), place('finca', false), place('local', false)], 'finca');

    expect(result.map((p) => p.id)).toEqual(['casa', 'finca', 'local']);
    expect(result.filter((p) => p.isDefault).map((p) => p.id)).toEqual(['finca']);
    expect(selectedPlace(result)?.id).toBe('finca');
  });

  it('does not copy the places that did not change', () => {
    const local = place('local', false);
    const result = markSelected([place('casa', true), local], 'casa');
    expect(result[1]).toBe(local);
  });
});
