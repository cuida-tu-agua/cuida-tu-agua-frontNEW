import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { deviceRepository } from '../../../core/di/container';
import {
  EMPTY_LINK_DEVICE_FORM,
  formatPairingCodeInput,
  formatSerialInput,
  toLinkDeviceInput,
  validateLinkDeviceForm,
} from '../../../domain/devices/linkDeviceForm';
import { toAppError } from '../../../infrastructure/http/httpError';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { SuccessModal } from '../../components/common/SuccessModal';
import { useForm } from '../../hooks/useForm';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'LinkDevice'>;

const STEPS = [
  'Instala el medidor y conéctalo a la corriente.',
  'Conéctalo a tu WiFi (la luz azul queda fija cuando está en línea).',
  'Escribe el serial y el código que vienen en la etiqueta.',
];

/** HU-012: link a meter to the place (serial + pairing code printed on the box). */
export const LinkDeviceScreen: React.FC<Props> = ({ navigation, route }) => {
  const { placeId, placeName } = route.params;

  // Same rules as the domain (and as DeviceSecrets in ms-devices)
  const form = useForm(EMPTY_LINK_DEVICE_FORM, {
    serialNumber: (_, all) => validateLinkDeviceForm(all).serialNumber,
    pairingCode: (_, all) => validateLinkDeviceForm(all).pairingCode,
  });

  const [submitting, setSubmitting] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [offlineError, setOfflineError] = useState(false);
  const [linked, setLinked] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return; // double tap
    setBannerMessage(null);
    if (!form.validateAll()) return;

    setSubmitting(true);
    try {
      await deviceRepository.link(placeId, toLinkDeviceInput(form.values));
      setLinked(true); // success modal, then back to the meter screen
    } catch (error) {
      const appError = toAppError(error);
      const onAField = Object.keys(appError.fieldErrors).some(form.hasField);
      if (onAField) {
        form.setServerErrors(appError.fieldErrors); // e.g. wrong code → under "Código"
      } else {
        setBannerMessage(appError.message); // offline meter, already linked, locked, no internet...
        setOfflineError(appError.code === 'device.offline');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLinkedDismiss = useCallback(() => {
    setLinked(false);
    navigation.goBack(); // PlaceDeviceScreen reloads when it gets the focus back
  }, [navigation]);

  return (
    <KeyboardAvoidingView style={screenStyle} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled">
        <Text style={titleStyle}>Vincular medidor a {placeName}</Text>

        <View style={stepsStyle}>
          <Text style={stepsTitleStyle}>Antes de empezar</Text>
          {STEPS.map((step, index) => (
            <View key={step} style={stepRowStyle}>
              <View style={stepNumberStyle}>
                <Text style={stepNumberTextStyle}>{index + 1}</Text>
              </View>
              <Text style={stepTextStyle}>{step}</Text>
            </View>
          ))}
        </View>

        {!!bannerMessage && (
          <Banner
            tone="error"
            message={bannerMessage}
            onClose={() => setBannerMessage(null)}
            action={
              offlineError
                ? { label: 'Configurar WiFi del medidor', onPress: () => navigation.navigate('DeviceWifiSetup', { placeId, placeName }) }
                : undefined
            }
          />
        )}

        <Input
          label="Serial del medidor"
          placeholder="SW-ESP32-000001"
          value={form.values.serialNumber}
          onChangeText={(text) => form.setValue('serialNumber', formatSerialInput(text))}
          onBlur={() => form.blur('serialNumber')}
          error={form.errors.serialNumber}
          autoCapitalize="characters"
          maxLength={32}
          editable={!submitting}
          returnKeyType="next"
        />

        <Input
          label="Código de emparejamiento"
          placeholder="ABCD-EFGH"
          value={form.values.pairingCode}
          onChangeText={(text) => form.setValue('pairingCode', formatPairingCodeInput(text))}
          onBlur={() => form.blur('pairingCode')}
          error={form.errors.pairingCode}
          hint="8 caracteres. No usa 0, O, 1, I ni L."
          autoCapitalize="characters"
          maxLength={9}
          editable={!submitting}
          returnKeyType="send"
          onSubmitEditing={handleSubmit}
        />

        <Button label="Vincular medidor" onPress={handleSubmit} loading={submitting} />
      </ScrollView>

      <SuccessModal
        visible={linked}
        message="Medidor vinculado. Ya puedes ver su estado."
        onDismiss={handleLinkedDismiss}
        autoCloseDuration={1500}
      />
    </KeyboardAvoidingView>
  );
};

const screenStyle: ViewStyle = themed(() => ({ flex: 1, backgroundColor: theme.colors.background }));

const contentStyle: ViewStyle = {
  paddingHorizontal: theme.spacing.lg,
  paddingTop: theme.spacing.xl,
  paddingBottom: theme.spacing.huge,
};

const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h2, color: theme.colors.textPrimary, marginBottom: theme.spacing.lg }));

const stepsStyle: ViewStyle = themed(() => ({
  backgroundColor: theme.colors.surfaceAlt,
  borderRadius: theme.borderRadius.medium,
  padding: theme.spacing.lg,
  gap: theme.spacing.md,
  marginBottom: theme.spacing.xl,
}));

const stepsTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, color: theme.colors.textPrimary, textTransform: 'uppercase' }));

const stepRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md };

const stepNumberStyle: ViewStyle = themed(() => ({
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: theme.colors.primary,
  alignItems: 'center',
  justifyContent: 'center',
}));

const stepNumberTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, color: theme.colors.textOnPrimary }));

const stepTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary, flex: 1 }));
