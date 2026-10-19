import i18n from '../../i18n';
import { localeTag } from '../../i18n/format';
import { Currency } from '../places/Place';

/** MANUAL = typed by the user from their bill (HU-054). CATALOG = preloaded for the city and stratum (HU-066). */
export type TariffSource = 'MANUAL' | 'CATALOG';

export interface CatalogRates {
  fixedCharge: number;
  basicPrice: number;
  complementaryPrice: number;
  luxuryPrice: number;
  basicLimitM3: number;
  complementaryLimitM3: number;
  /** Date (YYYY-MM-DD) of the last update of these prices (HU-066). */
  updatedAt: string;
  source: string;
}

export interface Tariff {
  id: number;
  source: TariffSource;
  unitPricePerM3: number | null;
  fixedMonthlyCharge: number | null;
  stratum: number | null;
  currency: Currency;
  validFrom: string; // ISO 8601, UTC
  catalog: CatalogRates | null;
}

/** current is null while the place has no tariff: the app invites to set one instead of showing zero. */
export interface PlaceTariffs {
  current: Tariff | null;
  history: Tariff[];
}

export interface CatalogStratum {
  stratum: number;
  rates: CatalogRates;
}

export interface TariffCatalog {
  cityId: string;
  cityName: string;
  available: boolean;
  strata: CatalogStratum[];
}

export interface CostTier {
  name: string;
  cubicMeters: number;
  pricePerM3: number;
  cost: number;
}

export interface CostEstimate {
  placeId: string;
  period: 'DAY' | 'WEEK' | 'MONTH';
  from: string;
  to: string;
  liters: number;
  cubicMeters: number;
  hasTariff: boolean;
  catalogAvailable: boolean;
  currency: Currency;
  tariff: { source: TariffSource; stratum: number | null; validFrom: string; catalogUpdatedAt: string | null } | null;
  volumetricCost: number | null;
  fixedCharge: number | null;
  total: number | null;
  tiers: CostTier[];
  isEstimate: boolean;
  disclaimer: string;
}

export interface ManualTariffInput {
  unitPricePerM3: number;
  fixedMonthlyCharge: number | null;
}

export const STRATA = [1, 2, 3, 4, 5, 6];

export const MAX_UNIT_PRICE = 1_000_000;
export const MAX_FIXED_CHARGE = 10_000_000;

/** "$ 162.800" for pesos (no cents) and "US$ 12,50" for dollars in Spanish; "$ 162,800" and "US$ 12.50" in English. */
export const formatMoney = (amount: number, currency: Currency): string => {
  const english = localeTag().startsWith('en');
  const decimals = currency === 'COP' ? 0 : 2;
  const fixed = Math.abs(amount).toFixed(decimals);
  const [whole, fraction] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, english ? ',' : '.');
  const sign = amount < 0 ? '-' : '';
  const prefix = currency === 'COP' ? '$' : 'US$';
  return `${sign}${prefix} ${grouped}${fraction ? `${english ? '.' : ','}${fraction}` : ''}`;
};

/**
 * What the user typed in a price field -> number, or null when it is not a number.
 * Spanish: "5.234" is 5234 (dot = thousands, as on the bill) and "5234,5" is 5234.5 (comma = decimal).
 * English: "5,234" is 5234 (comma = thousands) and "5234.5" is 5234.5 (dot = decimal).
 * A lone mark followed by 1-2 digits is always the decimal mark in either language.
 */
export const parseMoneyInput = (text: string): number | null => {
  const clean = text.replace(/\s|\$|US/g, '');
  if (!clean || !/^[\d.,]+$/.test(clean)) return null;

  const english = localeTag().startsWith('en');
  const thousands = english ? ',' : '.';
  const decimal = english ? '.' : ',';
  const groupedOnly = new RegExp(`^\\d{1,3}(\\${thousands}\\d{3})+$`);

  let normalized: string;
  if (clean.includes(decimal)) {
    normalized = clean.split(thousands).join('').replace(decimal, '.');
  } else if (groupedOnly.test(clean)) {
    normalized = clean.split(thousands).join('');
  } else {
    normalized = clean.replace(thousands, '.');
  }
  if ((normalized.match(/\./g) ?? []).length > 1) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
};

export interface ManualTariffForm {
  price: string;
  fixedCharge: string;
}

export interface ManualTariffValidation {
  errors: Partial<Record<keyof ManualTariffForm, string>>;
  value: ManualTariffInput | null;
}

/** HU-054: the price per m3 is required (> 0); the fixed monthly charge is optional (>= 0). */
export const validateManualTariff = (form: ManualTariffForm): ManualTariffValidation => {
  const errors: ManualTariffValidation['errors'] = {};

  const price = parseMoneyInput(form.price);
  if (!form.price.trim()) errors.price = i18n.t('tariff.priceRequired');
  else if (price === null) errors.price = i18n.t('tariff.priceNotNumber');
  else if (price <= 0) errors.price = i18n.t('tariff.pricePositive');
  else if (price > MAX_UNIT_PRICE) errors.price = i18n.t('tariff.priceTooHigh');

  let fixedCharge: number | null = null;
  if (form.fixedCharge.trim()) {
    fixedCharge = parseMoneyInput(form.fixedCharge);
    if (fixedCharge === null) errors.fixedCharge = i18n.t('tariff.fixedNotNumber');
    else if (fixedCharge < 0) errors.fixedCharge = i18n.t('tariff.fixedNegative');
    else if (fixedCharge > MAX_FIXED_CHARGE) errors.fixedCharge = i18n.t('tariff.fixedTooHigh');
  }

  if (Object.keys(errors).length > 0 || price === null) return { errors, value: null };
  return { errors, value: { unitPricePerM3: price, fixedMonthlyCharge: fixedCharge } };
};

/** HU-069: where the numbers come from, in words. */
export const sourceLabel = (source: TariffSource, stratum: number | null): string =>
  source === 'MANUAL' ? i18n.t('tariff.sourceManual') : i18n.t('tariff.sourceCatalog', { stratum: stratum ?? '?' });

/** "1 de enero de 2026" / "January 1, 2026" for a YYYY-MM-DD date (the day the official prices were last updated). */
export const formatCatalogDate = (date: string): string => {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return date;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(localeTag(), { dateStyle: 'long', timeZone: 'UTC' });
};

export const API_PERIOD: Record<'DAY' | 'WEEK' | 'MONTH', string> = { DAY: 'day', WEEK: 'week', MONTH: 'month' };
