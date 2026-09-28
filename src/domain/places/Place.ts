export type PlaceType = 'RESIDENTIAL' | 'COMMERCIAL';
export type MeasurementUnit = 'LITERS' | 'CUBIC_METERS' | 'GALLONS';
export type Currency = 'COP' | 'USD';

export const PLACE_NAME_MAX_LENGTH = 200;
export const PLACE_ADDRESS_MAX_LENGTH = 500;

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  address: string;
  cityId: string;
  cityName: string;
  subdivisionId: string;
  subdivisionName: string;
  countryCode: string;
  countryName: string;
  currency: Currency;
  measurementUnit: MeasurementUnit;
  isDefault: boolean;
  createdAt: string; // ISO 8601, UTC
  updatedAt: string;
}

export interface CreatePlaceInput {
  cityId: string;
  name: string;
  type: PlaceType;
  address: string;
  measurementUnit?: MeasurementUnit;
}

export interface UpdatePlaceInput {
  cityId: string;
  name: string;
  type: PlaceType;
  address: string;
  measurementUnit: MeasurementUnit;
}