import { Place } from '../Place';
import {
  EMPTY_PLACE_FORM,
  hasErrors,
  isFormDirty,
  PlaceFormValues,
  placeToFormValues,
  toCreatePlaceInput,
  toUpdatePlaceInput,
  validatePlaceForm,
} from '../placeForm';

const validForm: PlaceFormValues = {
  name: '  Casa Bogotá  ',
  type: 'RESIDENTIAL',
  address: ' Cra 7 # 12-34 ',
  countryCode: 'CO',
  subdivisionId: 'sub-11',
  cityId: 'city-11001',
  measurementUnit: 'LITERS',
};

const place: Place = {
  id: 'place-1',
  name: 'Casa Bogotá',
  type: 'RESIDENTIAL',
  address: 'Cra 7 # 12-34',
  cityId: 'city-11001',
  cityName: 'Bogotá, D.C.',
  subdivisionId: 'sub-11',
  subdivisionName: 'Bogotá, D.C.',
  countryCode: 'CO',
  countryName: 'Colombia',
  currency: 'COP',
  measurementUnit: 'LITERS',
  isDefault: true,
  createdAt: '2026-09-26T12:00:00Z',
  updatedAt: '2026-09-26T12:00:00Z',
};

describe('validatePlaceForm', () => {
  it('accepts a complete form', () => {
    expect(hasErrors(validatePlaceForm(validForm))).toBe(false);
  });

  it('requires every field of an empty form', () => {
    const errors = validatePlaceForm(EMPTY_PLACE_FORM);
    expect(Object.keys(errors).sort()).toEqual(
      ['address', 'cityId', 'countryCode', 'measurementUnit', 'name', 'subdivisionId', 'type'].sort(),
    );
  });

  it('treats a name with only spaces as empty', () => {
    expect(validatePlaceForm({ ...validForm, name: '   ' }).name).toBeDefined();
  });

  it('accepts 200 characters and rejects 201 (same limit as the backend)', () => {
    expect(validatePlaceForm({ ...validForm, name: 'a'.repeat(200) }).name).toBeUndefined();
    expect(validatePlaceForm({ ...validForm, name: 'a'.repeat(201) }).name).toBeDefined();
  });

  it('rejects an address longer than 500 characters', () => {
    expect(validatePlaceForm({ ...validForm, address: 'a'.repeat(501) }).address).toBeDefined();
  });
});

describe('form <-> API mapping', () => {
  it('builds the POST body with trimmed text', () => {
    expect(toCreatePlaceInput(validForm)).toEqual({
      cityId: 'city-11001',
      name: 'Casa Bogotá',
      type: 'RESIDENTIAL',
      address: 'Cra 7 # 12-34',
      measurementUnit: 'LITERS',
    });
  });

  it('builds the PUT body', () => {
    expect(toUpdatePlaceInput({ ...validForm, measurementUnit: 'GALLONS' }).measurementUnit).toBe('GALLONS');
  });

  it('fills the edit form from a loaded place', () => {
    expect(placeToFormValues(place)).toEqual({
      name: 'Casa Bogotá',
      type: 'RESIDENTIAL',
      address: 'Cra 7 # 12-34',
      countryCode: 'CO',
      subdivisionId: 'sub-11',
      cityId: 'city-11001',
      measurementUnit: 'LITERS',
    });
  });
});

describe('isFormDirty', () => {
  const original = placeToFormValues(place);

  it('is false when nothing changed or only spaces were added', () => {
    expect(isFormDirty(original, original)).toBe(false);
    expect(isFormDirty({ ...original, name: ' Casa Bogotá ' }, original)).toBe(false);
  });

  it('is true when a field changed', () => {
    expect(isFormDirty({ ...original, cityId: 'city-05001' }, original)).toBe(true);
    expect(isFormDirty({ ...original, type: 'COMMERCIAL' }, original)).toBe(true);
  });
});