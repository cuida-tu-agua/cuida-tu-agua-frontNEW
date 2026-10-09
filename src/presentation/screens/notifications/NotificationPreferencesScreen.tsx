import React from 'react';
import { ActivityIndicator, ScrollView, Switch, Text, TextStyle, View, ViewStyle } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  CHANNELS,
  CHANNEL_LABELS,
  LevelPreference,
  NotificationChannel,
  SEVERITY_HINTS,
  SEVERITY_LABELS,
  lockOf,
} from '../../../domain/notifications/Notification';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useNotificationPreferences } from '../../hooks/useNotificationPreferences';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';

type Props = NativeStackScreenProps<MainStackParamList, 'NotificationPreferences'>;

/** HU-034: for each urgency level the user chooses where the alert reaches them. Every switch saves by itself. */
export const NotificationPreferencesScreen: React.FC<Props> = () => {
  const prefs = useNotificationPreferences();

  if (!prefs.levels) {
    return (
      <View style={centerStyle}>
        {prefs.error ? (
          <>
            <Banner tone="error" message={prefs.error.message} />
            <Button label="Reintentar" onPress={() => void prefs.reload()} />
          </>
        ) : (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        )}
      </View>
    );
  }

  return (
    <ScrollView style={screenStyle} contentContainerStyle={contentStyle}>
      <Text style={introStyle}>
        Elige por dónde quieres recibir cada tipo de alerta. Los cambios se guardan al instante y valen para las próximas alertas.
      </Text>
      {!!prefs.error && <Banner tone="error" message={prefs.error.message} onClose={prefs.dismissError} />}

      <View style={gridStyle}>
        {prefs.levels.map((level) => (
          <LevelCard key={level.severity} level={level} saving={prefs.saving} onToggle={(c) => void prefs.toggle(level.severity, c)} />
        ))}
      </View>
    </ScrollView>
  );
};

const LevelCard: React.FC<{
  level: LevelPreference;
  saving: string | null;
  onToggle: (channel: NotificationChannel) => void;
}> = ({ level, saving, onToggle }) => (
  <Card variant="outlined" style={cardStyle}>
    <Text style={levelTitleStyle}>{SEVERITY_LABELS[level.severity]}</Text>
    <Text style={levelHintStyle}>{SEVERITY_HINTS[level.severity]}</Text>

    {CHANNELS.map((channel) => {
      const lock = lockOf(level.severity, channel);
      return (
        <View key={channel} style={rowStyle}>
          <View style={{ flex: 1 }}>
            <Text style={channelStyle}>{CHANNEL_LABELS[channel]}</Text>
            {lock === 'always' && <Text style={noteStyle}>Siempre activo</Text>}
            {lock === 'soon' && <Text style={noteStyle}>Próximamente</Text>}
          </View>
          <Switch
            value={lock === 'soon' ? false : level[channel]} // a channel that does not exist yet never looks on
            onValueChange={() => onToggle(channel)}
            disabled={!!lock || saving === `${level.severity}.${channel}`}
            trackColor={{ false: theme.colors.grayMedium, true: theme.colors.primary }}
            accessibilityLabel={`${CHANNEL_LABELS[channel]} para alertas ${SEVERITY_LABELS[level.severity].toLowerCase()}`}
          />
        </View>
      );
    })}
  </Card>
);

const screenStyle: ViewStyle = { flex: 1, backgroundColor: theme.colors.background };
const contentStyle: ViewStyle = { padding: theme.spacing.lg, paddingBottom: theme.spacing.huge, gap: theme.spacing.lg };
const centerStyle: ViewStyle = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing.xl,
  gap: theme.spacing.md,
  backgroundColor: theme.colors.background,
};
const introStyle: TextStyle = { ...theme.textStyles.caption, fontSize: 15, color: theme.colors.textSecondary };
const gridStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.lg };
const cardStyle: ViewStyle = { flexGrow: 1, flexBasis: 300, gap: theme.spacing.sm };
const levelTitleStyle: TextStyle = { ...theme.textStyles.h2, fontSize: 20, color: theme.colors.textPrimary };
const levelHintStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textMuted, marginBottom: theme.spacing.sm };
const rowStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.md,
  paddingVertical: theme.spacing.sm,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
};
const channelStyle: TextStyle = { ...theme.textStyles.caption, fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary };
const noteStyle: TextStyle = { ...theme.textStyles.label, color: theme.colors.textMuted };
