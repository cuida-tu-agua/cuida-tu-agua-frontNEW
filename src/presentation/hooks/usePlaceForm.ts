import { useCallback, useEffect, useRef, useState } from 'react';
import { geographyRepository } from '../../core/di/container';
import { AppError } from '../../domain/common/AppError';
import { City, Country, GeographyRepository, Subdivision } from '../../domain/geography/Geography';
import { Place } from '../../domain/places/Place';
import {
  EMPTY_PLACE_FORM,
  hasErrors,
  isFormDirty,
  PlaceFormErrors,
  PlaceFormField,
  PlaceFormValues,
  placeToFormValues,
  validatePlaceForm,
} from '../../domain/places/placeForm';

interface CatalogState {
  countries: Country[];
  subdivisions: Subdivision[];
  cities: City[];
}

interface LoadingState {
  countries: boolean;
  subdivisions: boolean;
  cities: boolean;
}

const errorMessage = (error: unknown) =>
  error instanceof AppError ? error.message : 'No se pudo cargar el catálogo.';


export const usePlaceForm = (geography: GeographyRepository = geographyRepository) => {
  const [values, setValues] = useState<PlaceFormValues>(EMPTY_PLACE_FORM);
  const [initialValues, setInitialValues] = useState<PlaceFormValues>(EMPTY_PLACE_FORM);
  const [errors, setErrors] = useState<PlaceFormErrors>({});
  const [catalog, setCatalog] = useState<CatalogState>({ countries: [], subdivisions: [], cities: [] });
  const [loading, setLoading] = useState<LoadingState>({ countries: true, subdivisions: false, cities: false });
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const subdivisionsRequest = useRef(0);
  const citiesRequest = useRef(0);

  const [countriesAttempt, setCountriesAttempt] = useState(0);

  const reloadCountries = useCallback(() => {
    setCatalogError(null);
    setLoading((l) => ({ ...l, countries: true }));
    setCountriesAttempt((n) => n + 1);
  }, []);

  const loadSubdivisions = useCallback(async (countryCode: string) => {
    const requestId = ++subdivisionsRequest.current;
    setLoading((l) => ({ ...l, subdivisions: true }));
    try {
      const subdivisions = await geography.listSubdivisions(countryCode);
      if (requestId === subdivisionsRequest.current) setCatalog((c) => ({ ...c, subdivisions }));
    } catch (error) {
      if (requestId === subdivisionsRequest.current) setCatalogError(errorMessage(error));
    } finally {
      if (requestId === subdivisionsRequest.current) setLoading((l) => ({ ...l, subdivisions: false }));
    }
  }, [geography]);

  const loadCities = useCallback(async (subdivisionId: string) => {
    const requestId = ++citiesRequest.current;
    setLoading((l) => ({ ...l, cities: true }));
    try {
      const cities = await geography.listCities(subdivisionId);
      if (requestId === citiesRequest.current) setCatalog((c) => ({ ...c, cities }));
    } catch (error) {
      if (requestId === citiesRequest.current) setCatalogError(errorMessage(error));
    } finally {
      if (requestId === citiesRequest.current) setLoading((l) => ({ ...l, cities: false }));
    }
  }, [geography]);

  useEffect(() => {
    let active = true;
    geography
      .listCountries()
      .then((countries) => {
        if (active) setCatalog((c) => ({ ...c, countries }));
      })
      .catch((error: unknown) => {
        if (active) setCatalogError(errorMessage(error));
      })
      .finally(() => {
        if (active) setLoading((l) => ({ ...l, countries: false }));
      });
    return () => {
      active = false;
    };
  }, [geography, countriesAttempt]);

  const setField = useCallback(<K extends PlaceFormField>(field: K, value: PlaceFormValues[K]) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }, []);

  const selectCountry = useCallback((countryCode: string) => {
    const country = catalog.countries.find((c) => c.code === countryCode);
    setValues((v) => ({
      ...v,
      countryCode,
      subdivisionId: null,
      cityId: null,
      measurementUnit: v.measurementUnit ?? country?.defaultUnit ?? null,
    }));
    setErrors((e) => ({ ...e, countryCode: undefined, subdivisionId: undefined, cityId: undefined }));
    setCatalog((c) => ({ ...c, subdivisions: [], cities: [] }));
    loadSubdivisions(countryCode);
  }, [catalog.countries, loadSubdivisions]);

  const selectSubdivision = useCallback((subdivisionId: string) => {
    setValues((v) => ({ ...v, subdivisionId, cityId: null }));
    setErrors((e) => ({ ...e, subdivisionId: undefined, cityId: undefined }));
    setCatalog((c) => ({ ...c, cities: [] }));
    loadCities(subdivisionId);
  }, [loadCities]);

  const selectCity = useCallback((cityId: string) => setField('cityId', cityId), [setField]);

  const hydrate = useCallback(async (place: Place) => {
    const formValues = placeToFormValues(place);
    setValues(formValues);
    setInitialValues(formValues);
    setErrors({});
    await Promise.all([loadSubdivisions(place.countryCode), loadCities(place.subdivisionId)]);
  }, [loadSubdivisions, loadCities]);

  const validate = useCallback((): boolean => {
    const result = validatePlaceForm(values);
    setErrors(result);
    return !hasErrors(result);
  }, [values]);

  const applyServerErrors = useCallback((fieldErrors: Record<string, string>) => {
    setErrors((e) => ({ ...e, ...(fieldErrors as PlaceFormErrors) }));
  }, []);

  const selectedCountry = catalog.countries.find((c) => c.code === values.countryCode) ?? null;

  return {
    values,
    errors,
    catalog,
    loading,
    catalogError,
    selectedCountry,
    isDirty: isFormDirty(values, initialValues),
    setField,
    selectCountry,
    selectSubdivision,
    selectCity,
    hydrate,
    validate,
    applyServerErrors,
    reloadCountries,
  };
};

export type PlaceFormController = ReturnType<typeof usePlaceForm>;