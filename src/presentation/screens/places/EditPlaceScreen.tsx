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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { placeRepository } from '../../../core/di/container';
import { AppError } from '../../../domain/common/AppError';
import { Place } from '../../../domain/places/Place';
import { toUpdatePlaceInput } from '../../../domain/places/placeForm';
import { Button } from '../../components/common/Button';
import { SuccessModal } from '../../components/common/SuccessModal';
import { PlaceForm } from '../../components/places/placeForm';
import { usePlaceForm } from '../../hooks/usePlaceForm';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';

type Props = NativeStackScreenProps<MainStackParamList, 'EditPlace'>;

const containerStyle: ViewStyle = { flex: 1, backgroundColor: theme.colors.background };

const contentStyle: ViewStyle = {
  paddingHorizontal: theme.spacing.lg,
  paddingTop: theme.spacing.xl,
  paddingBottom: theme.spacing.huge,
};

const centeredStyle: ViewStyle = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing.xl,
  backgroundColor: theme.colors.background,
};

const messageStyle: TextStyle = {
  ...theme.textStyles.body,
  color: theme.colors.textSecondary,
  textAlign: 'center',
  marginVertical: theme.spacing.lg,
};

const infoBannerStyle: ViewStyle = {
  backgroundColor: theme.colors.successBg,
  borderRadius: theme.borderRadius.small,
  padding: theme.spacing.md,
  marginBottom: theme.spacing.lg,
};

const infoBannerTextStyle: TextStyle = {
  ...theme.textStyles.caption,
  color: theme.colors.success,
};

const metaStyle: TextStyle = {
  ...theme.textStyles.label, // dates are data: IBM Plex Mono
  color: theme.colors.textMuted,
  marginBottom: theme.spacing.lg,
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

export const EditPlaceScreen: React.FC<Props> = ({ navigation, route }) => {
  const { placeId, justCreated } = route.params;
  const form = usePlaceForm();
  const { hydrate } = form;

  const [place, setPlace] = useState<Place | null>(null);
  const [loadError, setLoadError] = useState<AppError | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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
        {justCreated && (
          <View style={infoBannerStyle}>
            <Text style={infoBannerTextStyle}>Lugar registrado. Revisa los datos o ajústalos aquí.</Text>
          </View>
        )}

        <Text style={metaStyle}>Última modificación: {formatDate(place.updatedAt)}</Text>

        <PlaceForm
          form={form}
          submitLabel={form.isDirty ? 'Guardar cambios' : 'Sin cambios'}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitError={submitError}
          submitDisabled={!form.isDirty}
        />
      </ScrollView>

      <SuccessModal
        visible={saved}
        message="Los cambios del lugar se guardaron."
        onDismiss={handleSavedDismiss}
        autoCloseDuration={1500}
      />
    </KeyboardAvoidingView>
  );
};