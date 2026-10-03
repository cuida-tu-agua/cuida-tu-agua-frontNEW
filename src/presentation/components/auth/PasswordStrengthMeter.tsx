import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../styles/theme';
import { UIcon } from './UIcon';
import { passwordRules } from '../../../domain/auth/passwordPolicy';

interface PasswordStrengthMeterProps {
  password: string;
}

const SEGMENTS = 4;

const LEVELS = [
  { label: '', color: theme.colors.grayMedium },
  { label: 'Débil', color: theme.colors.error },
  { label: 'Regular', color: theme.colors.warning },
  { label: 'Fuerte', color: theme.colors.primaryActive },
  { label: 'Muy fuerte', color: theme.colors.success },
];

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const rules = passwordRules(password);
  const score = password ? rules.filter((r) => r.met).length : 0;
  const level = LEVELS[score];

  return (
    <View
      style={containerStyle}
      accessible
      accessibilityLabel={`Seguridad de la contraseña: ${level.label || 'sin evaluar'}`}
    >
      <View style={headerRowStyle}>
        <View style={segmentsRowStyle}>
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <View
              key={i}
              style={[
                segmentStyle,
                { backgroundColor: i < score ? level.color : theme.colors.infoBg },
              ]}
            />
          ))}
        </View>

        <View style={levelLabelRowStyle}>
          {!!level.label && <Text style={[levelTextStyle, { color: level.color }]}>{level.label}</Text>}
          {score >= 3 && <UIcon name="check" size={14} color={level.color} />}
        </View>
      </View>

      <View style={chipsRowStyle}>
        {rules.map((rule) => (
          <View
            key={rule.id}
            accessible
            accessibilityLabel={`${rule.label}: ${rule.met ? 'cumple' : 'falta'}`}
            style={[chipStyle, { backgroundColor: rule.met ? theme.colors.infoBg : theme.colors.grayLight }]}
          >
            <UIcon
              name={rule.met ? 'check' : 'circle'}
              size={11}
              color={rule.met ? theme.colors.primaryActive : theme.colors.textMuted}
            />
            <Text style={[chipTextStyle, { color: rule.met ? theme.colors.textPrimary : theme.colors.textMuted }]}>
              {rule.shortLabel}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const containerStyle: ViewStyle = {
  marginTop: -theme.spacing.sm, 
  marginBottom: theme.spacing.lg,
};

const headerRowStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: theme.spacing.md,
};

const segmentsRowStyle: ViewStyle = {
  flex: 1,
  flexDirection: 'row',
  gap: 6,
};

const segmentStyle: ViewStyle = {
  flex: 1,
  height: 6,
  borderRadius: theme.borderRadius.full,
};

const levelLabelRowStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.spacing.xs,
  minWidth: 96,
  marginLeft: theme.spacing.md,
};

const levelTextStyle: TextStyle = {
  ...theme.textStyles.label,
  fontWeight: '800',
};

const chipsRowStyle: ViewStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: theme.spacing.sm,
};

const chipStyle: ViewStyle = {
  flex: 1, 
  flexDirection: 'row',
  alignItems: 'center',
  gap: 5,
  paddingHorizontal: theme.spacing.sm,
  paddingVertical: theme.spacing.xs,
  borderRadius: theme.borderRadius.full,
};

const chipTextStyle: TextStyle = {
  ...theme.textStyles.label,
  
};
