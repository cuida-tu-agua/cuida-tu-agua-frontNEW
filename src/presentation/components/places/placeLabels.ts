import i18n from '../../../i18n';
import { MeasurementUnit, PlaceType } from '../../../domain/places/Place';
import { SegmentOption } from '../common/SegmentedControl';

/** Functions, not constants: the text must follow the language that is active when the form is drawn. */
export const placeTypeOptions = (): SegmentOption<PlaceType>[] => [
  { value: 'RESIDENTIAL', label: i18n.t('places.types.RESIDENTIAL') },
  { value: 'COMMERCIAL', label: i18n.t('places.types.COMMERCIAL') },
];

export const measurementUnitOptions = (): SegmentOption<MeasurementUnit>[] => [
  { value: 'LITERS', label: i18n.t('places.units.LITERS') },
  { value: 'CUBIC_METERS', label: i18n.t('places.units.CUBIC_METERS') },
  { value: 'GALLONS', label: i18n.t('places.units.GALLONS') },
];

export const placeTypeLabel = (type: PlaceType): string => i18n.t(`places.types.${type}`);

export const subdivisionLabel = (countryCode: string | null): string =>
  i18n.t(countryCode === 'CO' ? 'places.geography.subdivisionCO' : 'places.geography.subdivisionOther');

export const cityLabel = (countryCode: string | null): string =>
  i18n.t(countryCode === 'CO' ? 'places.geography.cityCO' : 'places.geography.cityOther');
