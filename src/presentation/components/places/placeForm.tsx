import React from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { theme } from '../../styles/theme';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { SegmentedControl } from '../common/SegmentedControl';
import { SelectField } from '../common/SelectField';
import { PlaceFormController } from '../../hooks/usePlaceForm';
import {
  cityLabel,
  MEASUREMENT_UNIT_OPTIONS,
  PLACE_TYPE_OPTIONS,
  subdivisionLabel,
} from './placeLabels';

interface PlaceFormProps {
  form: PlaceFormController;
  submitLabel: string;
  onSubmit: () => void;
  submitting: boolean;
  submitError?: string | null;
  submitDisabled?: boolean;
}

const sectionTitleStyle: TextStyle = {
  ...theme.textStyles.h2,
  fontSize: theme.typography.sizes.h3,
  color: theme.colors.textPrimary,
  marginBottom: theme.spacing.lg,
};

const cardStyle: ViewStyle = { marginBottom: theme.spacing.lg };

const hintStyle: TextStyle = {
  ...theme.textStyles.caption,
  color: theme.colors.textMuted,
  marginTop: -theme.spacing.sm,
  marginBottom: theme.spacing.lg,
};

const currencyStyle: TextStyle = {
  ...theme.textStyles.label, // IBM Plex Mono: codes and data
  color: theme.colors.textSecondary,
};

const bannerStyle: ViewStyle = {
  backgroundColor: theme.colors.errorBg,
  borderRadius: theme.borderRadius.small,
  borderWidth: 1,
  borderColor: theme.colors.error,
  padding: theme.spacing.md,
  marginBottom: theme.spacing.lg,
};

const bannerTextStyle: TextStyle = {
  ...theme.textStyles.caption,
  color: theme.colors.error,
};

export const PlaceForm: React.FC<PlaceFormProps> = ({
  form,
  submitLabel,
  onSubmit,
  submitting,
  submitError,
  submitDisabled = false,
}) => {
  const { values, errors, catalog, loading, selectedCountry } = form;

  return (
    <View>
      {(submitError || form.catalogError) && (
        <View style={bannerStyle} accessibilityRole="alert">
          <Text style={bannerTextStyle}>{submitError ?? form.catalogError}</Text>
          {form.catalogError && catalog.countries.length === 0 && (
            <Button
              label="Reintentar"
              variant="ghost"
              size="small"
              onPress={form.reloadCountries}
            />
          )}
        </View>
      )}

      <Card style={cardStyle}>
        <Text style={sectionTitleStyle}>Datos del lugar</Text>

        <Input
          label="NOMBRE"
          placeholder="Ej: Casa, Local centro, Bodega"
          value={values.name}
          onChangeText={(text) => form.setField('name', text)}
          error={errors.name}
          editable={!submitting}
        />

        <SegmentedControl
          label="TIPO"
          options={PLACE_TYPE_OPTIONS}
          value={values.type}
          onChange={(type) => form.setField('type', type)}
          error={errors.type}
          disabled={submitting}
        />
      </Card>

      <Card style={cardStyle}>
        <Text style={sectionTitleStyle}>Ubicación</Text>

        <SelectField
          label="PAÍS"
          placeholder="Elige el país"
          value={values.countryCode}
          options={catalog.countries.map((c) => ({ value: c.code, label: c.name }))}
          onSelect={form.selectCountry}
          loading={loading.countries}
          disabled={submitting}
          error={errors.countryCode}
        />

        <SelectField
          label={subdivisionLabel(values.countryCode).toUpperCase()}
          placeholder={values.countryCode ? 'Elige una opción' : 'Primero elige el país'}
          value={values.subdivisionId}
          options={catalog.subdivisions.map((s) => ({ value: s.id, label: s.name }))}
          onSelect={form.selectSubdivision}
          loading={loading.subdivisions}
          disabled={!values.countryCode || submitting}
          error={errors.subdivisionId}
          searchable
        />

        <SelectField
          label={cityLabel(values.countryCode).toUpperCase()}
          placeholder={values.subdivisionId ? 'Elige una opción' : 'Primero elige el departamento'}
          value={values.cityId}
          options={catalog.cities.map((c) => ({ value: c.id, label: c.name }))}
          onSelect={form.selectCity}
          loading={loading.cities}
          disabled={!values.subdivisionId || submitting}
          error={errors.cityId}
          searchable
        />

        <Input
          label="DIRECCIÓN"
          placeholder="Ej: Cra 7 # 12-34"
          value={values.address}
          onChangeText={(text) => form.setField('address', text)}
          error={errors.address}
          editable={!submitting}
        />
      </Card>

      <Card style={cardStyle}>
        <Text style={sectionTitleStyle}>Medición</Text>

        <SegmentedControl
          label="UNIDAD PARA VER EL CONSUMO"
          options={MEASUREMENT_UNIT_OPTIONS}
          value={values.measurementUnit}
          onChange={(unit) => form.setField('measurementUnit', unit)}
          error={errors.measurementUnit}
          disabled={submitting}
        />

        {selectedCountry && (
          <Text style={hintStyle}>
            Moneda: <Text style={currencyStyle}>{selectedCountry.defaultCurrency}</Text> (la define el
            país)
          </Text>
        )}
      </Card>

      <Button
        label={submitLabel}
        onPress={onSubmit}
        loading={submitting}
        disabled={submitDisabled}
      />
    </View>
  );
};