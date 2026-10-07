import { placeNameOf, toPlaceNameMap, UNKNOWN_PLACE_NAME } from '../placeNames';

describe('toPlaceNameMap', () => {
  it('maps each place id to its name', () => {
    expect(
      toPlaceNameMap([
        { id: 'p1', name: 'Casa' },
        { id: 'p2', name: 'Local' },
      ]),
    ).toEqual({ p1: 'Casa', p2: 'Local' });
  });

  it('is empty when there are no places', () => {
    expect(toPlaceNameMap([])).toEqual({});
  });
});

describe('placeNameOf', () => {
  it('returns the name of a known place', () => {
    expect(placeNameOf({ p1: 'Casa' }, 'p1')).toBe('Casa');
  });

  it('falls back to a generic name for an unknown place', () => {
    expect(placeNameOf({ p1: 'Casa' }, 'otro')).toBe(UNKNOWN_PLACE_NAME);
  });
});
