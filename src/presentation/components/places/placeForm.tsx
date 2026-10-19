import React from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../styles/theme';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { SegmentedControl } from '../common/SegmentedControl';
import { SelectField } from '../common/SelectField';
import { PlaceFormController } from '../../hooks/usePlaceForm';
import {
  cityLabel,
  measurementUnitOptions,
  placeTypeOptions,
  subdivisionLabel,
} from './placeLabels';
import { themed } from '../../styles/themeRuntime';

interface PlaceFormProps {
  form: PlaceFormController;
  submitLabel: string;
  onSubmit: () => void;
  submitting: boolean;
  submitError?: string | null;
  submitDisabled?: boolean;
}

const sectionTitleStyle: TextStyle = themed(() => ({
  ...theme.textStyles.h2,
  fontSize: theme.typography.sizes.h3,
  color: theme.colors.textPrimary,
  marginBottom: theme.spacing.lg,
}));

const cardStyle: ViewStyle = { marginBottom: theme.spacing.lg };

const hintStyle: TextStyle = themed(() => ({
  ...theme.textStyles.caption,
  color: theme.colors.textMuted,
  marginTop: -theme.spacing.sm,
  marginBottom: theme.spacing.lg,
}));

const currencyStyle: TextStyle = themed(() => ({
  ...theme.textStyles.label, // IBM Plex Mono: codes and data
  color: theme.colors.textSecondary,
}));

const bannerStyle: ViewStyle = themed(() => ({
  backgroundColor: theme.colors.errorBg,
  borderRadius: theme.borderRadius.small,
  borderWidth: 1,
  borderColor: theme.colors.error,
  padding: theme.spacing.md,
  marginBottom: theme.spacing.lg,
}));

const bannerTextStyle: TextStyle = themed(() => ({
  ...theme.textStyles.caption,
  color: theme.colors.error,
}));

export const PlaceForm: React.FC<PlaceFormProps> = ({
  form,
  submitLabel,
  onSubmit,
  submitting,
  submitError,
  submitDisabled = false,
}) => {
  const { t } = useTranslation();
  const { values, errors, catalog, loading, selectedCountry } = form;

  return (
    <View>
      {(submitError || form.catalogError) && (
        <View style={bannerStyle} accessibilityRole="alert">
          <Text style={bannerTextStyle}>{submitError ?? form.catalogError}</Text>
          {form.catalogError && catalog.countries.length === 0 && (
            <Button
              label={t('common.retry')}
              variant="ghost"
              size="small"
              onPress={form.reloadCountries}
            />
          )}
        </View>
      )}

      <Card style={cardStyle}>
        <Text style={sectionTitleStyle}>{t('places.form.dataTitle')}</Text>

        <Input
          label={t('places.form.nameLabel')}
          placeholder={t('places.form.namePlaceholder')}
          value={values.name}
          onChangeText={(text) => form.setField('name', text)}
          error={errors.name}
          editable={!submitting}
        />

        <SegmentedControl
          label={t('places.form.typeLabel')}
          options={placeTypeOptions()}
          value={values.type}
          onChange={(type) => form.setField('type', type)}
          error={errors.type}
          disabled={submitting}
        />
      </Card>

      <Card style={cardStyle}>
        <Text style={sectionTitleStyle}>{t('places.form.locationTitle')}</Text>

        <SelectField
          label={t('places.form.countryLabel')}
          placeholder={t('places.form.countryPlaceholder')}
          value={values.countryCode}
          options={catalog.countries.map((c) => ({ value: c.code, label: c.name }))}
          onSelect={form.selectCountry}
          loading={loading.countries}
          disabled={submitting}
          error={errors.countryCode}
        />

        <SelectField
          label={subdivisionLabel(values.countryCode).toUpperCase()}
          placeholder={values.countryCode ? t('places.form.chooseOption') : t('places.form.chooseCountryFirst')}
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
          placeholder={values.subdivisionId ? t('places.form.chooseOption') : t('places.form.chooseSubdivisionFirst')}
          value={values.cityId}
          options={catalog.cities.map((c) => ({ value: c.id, label: c.name }))}
          onSelect={form.selectCity}
          loading={loading.cities}
          disabled={!values.subdivisionId || submitting}
          error={errors.cityId}
          searchable
        />

        <Input
          label={t('places.form.addressLabel')}
          placeholder={t('places.form.addressPlaceholder')}
          value={values.address}
          onChangeText={(text) => form.setField('address', text)}
          error={errors.address}
          editable={!submitting}
        />
      </Card>

      <Card style={cardStyle}>
        <Text style={sectionTitleStyle}>{t('places.form.measurementTitle')}</Text>

        <SegmentedControl
          label={t('places.form.unitLabel')}
          options={measurementUnitOptions()}
          value={values.measurementUnit}
          onChange={(unit) => form.setField('measurementUnit', unit)}
          error={errors.measurementUnit}
          disabled={submitting}
        />

        {selectedCountry && (
          <Text style={hintStyle}>
            {t('places.form.currencyPrefix')}
            <Text style={currencyStyle}>{selectedCountry.defaultCurrency}</Text>
            {t('places.form.currencySuffix')}
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