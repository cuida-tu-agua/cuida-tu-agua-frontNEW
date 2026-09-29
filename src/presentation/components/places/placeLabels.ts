import { MeasurementUnit, PlaceType } from '../../../domain/places/Place';
import { SegmentOption } from '../common/SegmentedControl';

export const PLACE_TYPE_OPTIONS: SegmentOption<PlaceType>[] = [
  { value: 'RESIDENTIAL', label: 'Residencial' },
  { value: 'COMMERCIAL', label: 'Comercial' },
];

export const MEASUREMENT_UNIT_OPTIONS: SegmentOption<MeasurementUnit>[] = [
  { value: 'LITERS', label: 'Litros' },
  { value: 'CUBIC_METERS', label: 'm³' },
  { value: 'GALLONS', label: 'Galones' },
];

export const subdivisionLabel = (countryCode: string | null): string =>
  countryCode === 'CO' ? 'Departamento' : 'Provincia';

export const cityLabel = (countryCode: string | null): string =>
  countryCode === 'CO' ? 'Municipio' : 'Cantón';