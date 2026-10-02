import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { placeRepository } from '../../../core/di/container';
import { AppError } from '../../../domain/common/AppError';
import { Place } from '../../../domain/places/Place';
import { toCreatePlaceInput } from '../../../domain/places/placeForm';
import { SuccessModal } from '../../components/common/SuccessModal';
import { PlaceForm } from '../../components/places/placeForm';
import { usePlaceForm } from '../../hooks/usePlaceForm';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';

type Props = NativeStackScreenProps<MainStackParamList, 'CreatePlace'>;

const containerStyle: ViewStyle = { flex: 1, backgroundColor: theme.colors.background };

const contentStyle: ViewStyle = {
  paddingHorizontal: theme.spacing.lg,
  paddingTop: theme.spacing.xl,
  paddingBottom: theme.spacing.huge,
};

const introStyle: TextStyle = {
  ...theme.textStyles.body,
  color: theme.colors.textSecondary,
  marginBottom: theme.spacing.xl,
};

export const CreatePlaceScreen: React.FC<Props> = ({ navigation }) => {
  const form = usePlaceForm();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [created, setCreated] = useState<Place | null>(null);

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!form.validate()) return; // errors are shown under each field

    setSubmitting(true);
    try {
      const place = await placeRepository.create(toCreatePlaceInput(form.values));
      setCreated(place); // opens the success modal
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('server', 'No se pudo registrar el lugar.');
      if (appError.kind === 'validation') form.applyServerErrors(appError.fieldErrors);
      setSubmitError(appError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessDismiss = useCallback(() => {
    if (!created) return;
    navigation.goBack();
  }, [created, navigation]);

  return (
    <KeyboardAvoidingView
      style={containerStyle}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled">
        <Text style={introStyle}>
          Registra cada sitio donde quieras medir el agua: tu casa, tu local o tu bodega.
        </Text>

        <PlaceForm
          form={form}
          submitLabel="Registrar lugar"
          onSubmit={handleSubmit}
          submitting={submitting}
          submitError={submitError}
        />
      </ScrollView>

      <SuccessModal
        visible={!!created}
        message={
          created?.isDefault
            ? `"${created.name}" quedó registrado y ya está seleccionado.`
            : `"${created?.name ?? ''}" quedó registrado.`
        }
        onDismiss={handleSuccessDismiss}
        autoCloseDuration={2000}
      />
    </KeyboardAvoidingView>
  );
};
