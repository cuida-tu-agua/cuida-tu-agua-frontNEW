import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { placeRepository } from '../../../core/di/container';
import { AppError } from '../../../domain/common/AppError';
import { Place } from '../../../domain/places/Place';
import { toUpdatePlaceInput } from '../../../domain/places/placeForm';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { SuccessModal } from '../../components/common/SuccessModal';
import { PlaceForm } from '../../components/places/placeForm';
import { usePlaceForm } from '../../hooks/usePlaceForm';
import i18n from '../../../i18n';
import { formatDateTime } from '../../../i18n/format';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'EditPlace'>;

const formColumnStyle: ViewStyle = { width: '100%', maxWidth: 720, alignSelf: 'center' };
const containerStyle: ViewStyle = themed(() => ({ flex: 1, backgroundColor: theme.colors.background }));

const centeredStyle: ViewStyle = themed(() => ({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing.xl,
  backgroundColor: theme.colors.background,
}));

const messageStyle: TextStyle = themed(() => ({
  ...theme.textStyles.body,
  color: theme.colors.textSecondary,
  textAlign: 'center',
  marginVertical: theme.spacing.lg,
}));

const sectionStyle: ViewStyle = themed(() => ({
  marginTop: theme.spacing.xxl,
  paddingTop: theme.spacing.xl,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
}));

const sectionTitleStyle: TextStyle = themed(() => ({
  ...theme.textStyles.label,
  color: theme.colors.textPrimary,
  textTransform: 'uppercase',
  marginBottom: theme.spacing.sm,
}));

const dangerZoneStyle: ViewStyle = themed(() => ({
  marginTop: theme.spacing.xxl,
  paddingTop: theme.spacing.xl,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
}));

const dangerTitleStyle: TextStyle = themed(() => ({
  ...theme.textStyles.label,
  color: theme.colors.error,
  textTransform: 'uppercase',
  marginBottom: theme.spacing.sm,
}));

const dangerTextStyle: TextStyle = themed(() => ({
  ...theme.textStyles.caption,
  color: theme.colors.textSecondary,
  marginBottom: theme.spacing.lg,
}));

const metaStyle: TextStyle = themed(() => ({
  ...theme.textStyles.label, // dates are data: IBM Plex Mono
  color: theme.colors.textMuted,
  marginBottom: theme.spacing.lg,
}));

const formatDate = (iso: string) =>
  formatDateTime(iso);

export const EditPlaceScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { placeId } = route.params;
  const form = usePlaceForm();
  const { hydrate } = form;

  const [place, setPlace] = useState<Place | null>(null);
  const [loadError, setLoadError] = useState<AppError | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<AppError | null>(null);

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    placeRepository
      .getById(placeId)
      .then(async (loaded) => {
        if (!active) return;
        setPlace(loaded);
        await hydrate(loaded);
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(error instanceof AppError ? error : new AppError('server', i18n.t('places.edit.loadFailed')));
        }
      });
    return () => {
      active = false;
    };
  }, [placeId, hydrate, attempt]);

  const retry = () => {
    setLoadError(null);
    setPlace(null);
    setAttempt((n) => n + 1);
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!form.validate()) return;

    setSubmitting(true);
    try {
      const updated = await placeRepository.update(placeId, toUpdatePlaceInput(form.values));
      setPlace(updated);
      setSaved(true); // opens the success modal
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('server', i18n.t('places.edit.saveFailed'));
      if (appError.kind === 'validation') form.applyServerErrors(appError.fieldErrors);
      setSubmitError(appError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSavedDismiss = useCallback(() => {
    setSaved(false);
    navigation.goBack();
  }, [navigation]);

  const handleDelete = async () => {
    if (!place) return;
    setDeleting(true);
    try {
      await placeRepository.remove(place.id);
      setConfirmingDelete(false);
      navigation.popTo('Places', { notice: t('places.edit.deleted', { name: place.name }) });
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('server', i18n.t('places.edit.deleteFailed'));
      setConfirmingDelete(false);
      setDeleteError(appError);
    } finally {
      setDeleting(false);
    }
  };

  const goToDevice = () => {
    if (!place) return;
    setDeleteError(null);
    navigation.navigate('PlaceDevice', { placeId, placeName: place.name });
  };

  if (loadError) {
    return (
      <View style={centeredStyle}>
        <Text style={messageStyle}>{loadError.message}</Text>
        {loadError.kind !== 'not_found' && <Button label={t('common.retry')} onPress={retry} />}
        <Button label={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  if (!place) {
    return (
      <View style={centeredStyle}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={messageStyle}>{t('places.edit.loading')}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={containerStyle}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <PageContainer>
        <PageHeader
          back={{ label: t('common.back'), onPress: () => navigation.goBack() }}
          title={t('places.edit.title')}
          subtitle={t('places.edit.lastModified', { date: formatDate(place.updatedAt) })}
        />
        {/* the title stays on the left; the form is centered in a 720 px column */}
        <View style={formColumnStyle}>
        {Platform.OS !== 'web' && <Text style={metaStyle}>{t('places.edit.lastModified', { date: formatDate(place.updatedAt) })}</Text>}

        <PlaceForm
          form={form}
          submitLabel={form.isDirty ? t('places.edit.saveChanges') : t('places.edit.noChanges')}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitError={submitError}
          submitDisabled={!form.isDirty}
        />

        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>{t('places.edit.meterTitle')}</Text>
          <Text style={dangerTextStyle}>{t('places.edit.meterText')}</Text>
          <Button
            label={t('places.edit.viewMeter')}
            variant="secondary"
            icon={<Ionicons name="speedometer-outline" size={20} color={theme.colors.textPrimary} />}
            onPress={goToDevice}
          />
        </View>

        <View style={dangerZoneStyle}>
          <Text style={dangerTitleStyle}>{t('places.edit.dangerTitle')}</Text>
          <Text style={dangerTextStyle}>
            {t('places.edit.dangerText')}
          </Text>
          {!!deleteError && (
            <Banner
              tone="error"
              message={deleteError.message}
              // HU-011: the place still has a meter → take the user straight to where it is unlinked
              action={deleteError.code === 'place.has_active_device' ? { label: t('places.edit.goToMeter'), onPress: goToDevice } : undefined}
              onClose={() => setDeleteError(null)}
            />
          )}
          <Button label={t('places.edit.delete')} variant="danger" onPress={() => setConfirmingDelete(true)} />
        </View>
        </View>
      </PageContainer>

      <ConfirmDialog
        visible={confirmingDelete}
        tone="danger"
        title={t('places.edit.confirmTitle', { name: place.name })}
        message={t('places.edit.confirmBody') + (place.isDefault ? t('places.edit.confirmBodyDefault') : '')}
        confirmLabel={t('places.edit.confirmYes')}
        cancelLabel={t('places.edit.confirmNo')}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />

      <SuccessModal
        visible={saved}
        message={t('places.edit.saved')}
        onDismiss={handleSavedDismiss}
        autoCloseDuration={1500}
      />
    </KeyboardAvoidingView>
  );
};
