import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import i18n from '../../../i18n';
import { placeRepository } from '../../../core/di/container';
import { AppError } from '../../../domain/common/AppError';
import { Place } from '../../../domain/places/Place';
import { toCreatePlaceInput } from '../../../domain/places/placeForm';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { SuccessModal } from '../../components/common/SuccessModal';
import { PlaceForm } from '../../components/places/placeForm';
import { usePlaceForm } from '../../hooks/usePlaceForm';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'CreatePlace'>;

const formColumnStyle: ViewStyle = { width: '100%', maxWidth: 720, alignSelf: 'center' };
const containerStyle: ViewStyle = themed(() => ({ flex: 1, backgroundColor: theme.colors.background }));

const introStyle: TextStyle = themed(() => ({
  ...theme.textStyles.body,
  color: theme.colors.textSecondary,
  marginBottom: theme.spacing.xl,
}));

export const CreatePlaceScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
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
      const appError = error instanceof AppError ? error : new AppError('server', i18n.t('places.create.failed'));
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
      <PageContainer>
        <PageHeader
          back={{ label: t('common.back'), onPress: () => navigation.goBack() }}
          title={t('places.create.title')}
          subtitle={t('places.create.intro')}
        />
        {/* the title stays on the left; the form is centered in a 720 px column */}
        <View style={formColumnStyle}>
        {Platform.OS !== 'web' && (
          <Text style={introStyle}>
            {t('places.create.intro')}
          </Text>
        )}

        <PlaceForm
          form={form}
          submitLabel={t('places.create.title')}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitError={submitError}
        />
        </View>
      </PageContainer>

      <SuccessModal
        visible={!!created}
        message={
          created?.isDefault
            ? t('places.create.savedSelected', { name: created.name })
            : t('places.create.saved', { name: created?.name ?? '' })
        }
        onDismiss={handleSuccessDismiss}
        autoCloseDuration={2000}
      />
    </KeyboardAvoidingView>
  );
};
