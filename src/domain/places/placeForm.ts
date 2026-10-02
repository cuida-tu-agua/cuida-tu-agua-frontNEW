import {
  CreatePlaceInput,
  MeasurementUnit,
  Place,
  PLACE_ADDRESS_MAX_LENGTH,
  PLACE_NAME_MAX_LENGTH,
  PlaceType,
  UpdatePlaceInput,
} from './Place';

export interface PlaceFormValues {
  name: string;
  type: PlaceType | null;
  address: string;
  countryCode: string | null;
  subdivisionId: string | null;
  cityId: string | null;
  measurementUnit: MeasurementUnit | null;
}

export type PlaceFormField = keyof PlaceFormValues;
export type PlaceFormErrors = Partial<Record<PlaceFormField, string>>;

export const EMPTY_PLACE_FORM: PlaceFormValues = {
  name: '',
  type: null,
  address: '',
  countryCode: null,
  subdivisionId: null,
  cityId: null,
  measurementUnit: null,
};


export const validatePlaceForm = (values: PlaceFormValues): PlaceFormErrors => {
  const errors: PlaceFormErrors = {};
  const name = values.name.trim();
  const address = values.address.trim();

  if (!name) errors.name = 'Escribe un nombre para el lugar.';
  else if (name.length > PLACE_NAME_MAX_LENGTH)
    errors.name = `Máximo ${PLACE_NAME_MAX_LENGTH} caracteres.`;

  if (!values.type) errors.type = 'Elige si es residencial o comercial.';

  if (!address) errors.address = 'Escribe la dirección.';
  else if (address.length > PLACE_ADDRESS_MAX_LENGTH)
    errors.address = `Máximo ${PLACE_ADDRESS_MAX_LENGTH} caracteres.`;

  if (!values.countryCode) errors.countryCode = 'Elige el país.';
  if (!values.subdivisionId) errors.subdivisionId = 'Elige el departamento o provincia.';
  if (!values.cityId) errors.cityId = 'Elige la ciudad.';
  if (!values.measurementUnit) errors.measurementUnit = 'Elige la unidad de medida.';

  return errors;
};

export const hasErrors = (errors: PlaceFormErrors): boolean =>
  Object.values(errors).some((message) => !!message);

export const placeToFormValues = (place: Place): PlaceFormValues => ({
  name: place.name,
  type: place.type,
  address: place.address,
  countryCode: place.countryCode,
  subdivisionId: place.subdivisionId,
  cityId: place.cityId,
  measurementUnit: place.measurementUnit,
});

export const toCreatePlaceInput = (values: PlaceFormValues): CreatePlaceInput => ({
  cityId: values.cityId!,
  name: values.name.trim(),
  type: values.type!,
  address: values.address.trim(),
  measurementUnit: values.measurementUnit ?? undefined,
});

export const toUpdatePlaceInput = (values: PlaceFormValues): UpdatePlaceInput => ({
  cityId: values.cityId!,
  name: values.name.trim(),
  type: values.type!,
  address: values.address.trim(),
  measurementUnit: values.measurementUnit!,
});

export const isFormDirty = (current: PlaceFormValues, original: PlaceFormValues): boolean =>
  (Object.keys(current) as PlaceFormField[]).some((field) => {
    const a = current[field];
    const b = original[field];
    return typeof a === 'string' && typeof b === 'string' ? a.trim() !== b.trim() : a !== b;
  });