import React, { useState } from 'react';
import { Linking, ScrollView, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DEVICE_SETUP_URL } from '../../../config/api';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'DeviceWifiSetup'>;

const STEPS: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  {
    icon: 'power',
    text: 'Enciende el medidor. Si es nuevo, su luz azul parpadea rápido. Si ya tenía otra red, mantén presionado el botón BOOT 5 segundos.',
  },
  {
    icon: 'wifi',
    text: 'En los ajustes WiFi de tu teléfono conéctate a la red "CuidaTuAgua-XXXX" (los 4 últimos dígitos del serial). La contraseña es el código de emparejamiento de la etiqueta, sin el guion.',
  },
  {
    icon: 'globe-outline',
    text: 'Si el teléfono dice "Sin internet", elige mantener la conexión. Luego toca "Abrir configuración".',
  },
  {
    icon: 'home-outline',
    text: 'Elige la red WiFi de tu casa (2.4 GHz), escribe su contraseña y toca "Guardar y conectar".',
  },
  {
    icon: 'arrow-undo-outline',
    text: 'Vuelve a conectar el teléfono a tu WiFi de siempre y regresa a esta app. En menos de un minuto el medidor aparecerá Conectado.',
  },
];

export const DeviceWifiSetupScreen: React.FC<Props> = ({ navigation, route }) => {
  const { placeId, placeName, next } = route.params;
  const [openError, setOpenError] = useState(false);

  const openSetupPage = async () => {
    setOpenError(false);
    try {
      await Linking.openURL(DEVICE_SETUP_URL);
    } catch {
      setOpenError(true);
    }
  };

  const done = () =>
    next === 'link'
      ? navigation.replace('LinkDevice', { placeId, placeName })
      : navigation.goBack(); // PlaceDeviceScreen reloads the status on focus

  return (
    <ScrollView style={screenStyle} contentContainerStyle={contentStyle}>
      <Text style={titleStyle}>Conectar el medidor a tu WiFi</Text>
      <Text style={mutedStyle}>Solo se hace una vez, o cuando cambies de router o de contraseña.</Text>

      {STEPS.map((step, index) => (
        <View key={step.text} style={stepStyle}>
          <View style={numberStyle}>
            <Text style={numberTextStyle}>{index + 1}</Text>
          </View>
          <Ionicons name={step.icon} size={20} color={theme.colors.primary} />
          <Text style={stepTextStyle}>{step.text}</Text>
        </View>
      ))}

      {openError && (
        <Banner
          tone="warning"
          message={`No se pudo abrir el navegador. Abre ${DEVICE_SETUP_URL} en Safari o Chrome mientras estás conectado a la red del medidor.`}
        />
      )}

      <Button
        label="Abrir configuración del medidor"
        onPress={openSetupPage}
        icon={<Ionicons name="open-outline" size={20} color={theme.colors.textOnPrimary} />}
      />
      <Button label={next === 'link' ? 'Listo, vincular medidor' : 'Listo'} variant="secondary" onPress={done} />

      <Banner
        tone="info"
        message="El medidor solo funciona con redes de 2.4 GHz. Si escribiste mal la contraseña, en un minuto vuelve a crear su red CuidaTuAgua para que lo intentes de nuevo."
      />
    </ScrollView>
  );
};

const screenStyle: ViewStyle = themed(() => ({ flex: 1, backgroundColor: theme.colors.background }));
const contentStyle: ViewStyle = { padding: theme.spacing.lg, paddingBottom: theme.spacing.huge, gap: theme.spacing.md };
const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h2, color: theme.colors.textPrimary }));
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted, marginBottom: theme.spacing.sm }));
const stepStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: theme.spacing.md,
  padding: theme.spacing.md,
  borderRadius: theme.borderRadius.medium,
  backgroundColor: theme.colors.surfaceAlt,
}));
const numberStyle: ViewStyle = themed(() => ({
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: theme.colors.primary,
  alignItems: 'center',
  justifyContent: 'center',
}));
const numberTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, color: theme.colors.textOnPrimary }));
const stepTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary, flex: 1 }));
