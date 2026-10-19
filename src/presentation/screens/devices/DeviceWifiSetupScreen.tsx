import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DEVICE_SETUP_URL } from '../../../config/api';
import { Banner } from '../../components/common/Banner';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'DeviceWifiSetup'>;

const formColumnStyle: ViewStyle = { width: '100%', maxWidth: 720, alignSelf: 'center', gap: theme.spacing.md };
const STEPS: { icon: keyof typeof Ionicons.glyphMap; key: 'power' | 'connect' | 'noInternet' | 'home' | 'back' }[] = [
  { icon: 'power', key: 'power' },
  { icon: 'wifi', key: 'connect' },
  { icon: 'globe-outline', key: 'noInternet' },
  { icon: 'home-outline', key: 'home' },
  { icon: 'arrow-undo-outline', key: 'back' },
];

export const DeviceWifiSetupScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { placeId, placeName = t('dashboard.defaultPlaceName'), next } = route.params;
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
    <PageContainer>
      <PageHeader back={{ label: t('common.back'), onPress: () => navigation.goBack() }} title={t('deviceScreens.wifi.title')} />
      {/* the title stays on the left; the content is centered in a 720 px column */}
      <View style={formColumnStyle}>
      <Text style={titleStyle}>{t('deviceScreens.wifi.heading')}</Text>
      <Text style={mutedStyle}>{t('deviceScreens.wifi.once')}</Text>

      {STEPS.map((step, index) => (
        <View key={step.key} style={stepStyle}>
          <View style={numberStyle}>
            <Text style={numberTextStyle}>{index + 1}</Text>
          </View>
          <Ionicons name={step.icon} size={20} color={theme.colors.primary} />
          <Text style={stepTextStyle}>{t(`deviceScreens.wifi.steps.${step.key}`)}</Text>
        </View>
      ))}

      {openError && (
        <Banner
          tone="warning"
          message={t('deviceScreens.wifi.openError', { url: DEVICE_SETUP_URL })}
        />
      )}

      <Button
        label={t('deviceScreens.wifi.openSetup')}
        onPress={openSetupPage}
        icon={<Ionicons name="open-outline" size={20} color={theme.colors.textOnPrimary} />}
      />
      <Button label={next === 'link' ? t('deviceScreens.wifi.doneLink') : t('deviceScreens.wifi.done')} variant="secondary" onPress={done} />

      <Banner
        tone="info"
        message={t('deviceScreens.wifi.note')}
      />
      </View>
    </PageContainer>
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
