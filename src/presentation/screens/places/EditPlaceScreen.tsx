import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { SuccessModal } from '../../components/common/SuccessModal';
import { PlaceForm } from '../../components/places/placeForm';
import { usePlaceForm } from '../../hooks/usePlaceForm';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'EditPlace'>;

const containerStyle: ViewStyle = themed(() => ({ flex: 1, backgroundColor: theme.colors.background }));

const contentStyle: ViewStyle = {
  paddingHorizontal: theme.spacing.lg,
  paddingTop: theme.spacing.xl,
  paddingBottom: theme.spacing.huge,
};

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
  new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

export const EditPlaceScreen: React.FC<Props> = ({ navigation, route }) => {
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
          setLoadError(error instanceof AppError ? error : new AppError('server', 'No se pudo cargar el lugar.'));
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
      const appError = error instanceof AppError ? error : new AppError('server', 'No se pudieron guardar los cambios.');
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
      navigation.popTo('Places', { notice: `Eliminaste "${place.name}".` });
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('server', 'No se pudo eliminar el lugar.');
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
        {loadError.kind !== 'not_found' && <Button label="Reintentar" onPress={retry} />}
        <Button label="Volver" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  if (!place) {
    return (
      <View style={centeredStyle}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={messageStyle}>Cargando lugar...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={containerStyle}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled">
        <Text style={metaStyle}>Última modificación: {formatDate(place.updatedAt)}</Text>

        <PlaceForm
          form={form}
          submitLabel={form.isDirty ? 'Guardar cambios' : 'Sin cambios'}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitError={submitError}
          submitDisabled={!form.isDirty}
        />

        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>Medidor</Text>
          <Text style={dangerTextStyle}>Vincula el medidor de este lugar o revisa si está conectado.</Text>
          <Button
            label="Ver medidor"
            variant="secondary"
            icon={<Ionicons name="speedometer-outline" size={20} color={theme.colors.textPrimary} />}
            onPress={goToDevice}
          />
        </View>

        <View style={dangerZoneStyle}>
          <Text style={dangerTitleStyle}>Zona de peligro</Text>
          <Text style={dangerTextStyle}>
            Si ya no usas este lugar puedes eliminarlo. Primero desvincula su medidor, si tiene uno.
          </Text>
          {!!deleteError && (
            <Banner
              tone="error"
              message={deleteError.message}
              // HU-011: the place still has a meter → take the user straight to where it is unlinked
              action={deleteError.code === 'place.has_active_device' ? { label: 'Ir al medidor', onPress: goToDevice } : undefined}
              onClose={() => setDeleteError(null)}
            />
          )}
          <Button label="Eliminar lugar" variant="danger" onPress={() => setConfirmingDelete(true)} />
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirmingDelete}
        tone="danger"
        title={`¿Eliminar "${place.name}"?`}
        message={
          'El lugar desaparecerá de tu lista y ya no podrás ver su historial de consumo en la app. ' +
          (place.isDefault ? 'Como es tu lugar seleccionado, seleccionaremos otro de tus lugares.' : '')
        }
        confirmLabel="Sí, eliminar lugar"
        cancelLabel="No, conservarlo"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />

      <SuccessModal
        visible={saved}
        message="Los cambios del lugar se guardaron."
        onDismiss={handleSavedDismiss}
        autoCloseDuration={1500}
      />
    </KeyboardAvoidingView>
  );
};
