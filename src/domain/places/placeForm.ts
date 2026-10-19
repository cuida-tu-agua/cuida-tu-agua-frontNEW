import i18n from '../../i18n';
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

  if (!name) errors.name = i18n.t('places.validation.nameRequired');
  else if (name.length > PLACE_NAME_MAX_LENGTH)
    errors.name = i18n.t('places.validation.maxLength', { max: PLACE_NAME_MAX_LENGTH });

  if (!values.type) errors.type = i18n.t('places.validation.typeRequired');

  if (!address) errors.address = i18n.t('places.validation.addressRequired');
  else if (address.length > PLACE_ADDRESS_MAX_LENGTH)
    errors.address = i18n.t('places.validation.maxLength', { max: PLACE_ADDRESS_MAX_LENGTH });

  if (!values.countryCode) errors.countryCode = i18n.t('places.validation.countryRequired');
  if (!values.subdivisionId) errors.subdivisionId = i18n.t('places.validation.subdivisionRequired');
  if (!values.cityId) errors.cityId = i18n.t('places.validation.cityRequired');
  if (!values.measurementUnit) errors.measurementUnit = i18n.t('places.validation.unitRequired');

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