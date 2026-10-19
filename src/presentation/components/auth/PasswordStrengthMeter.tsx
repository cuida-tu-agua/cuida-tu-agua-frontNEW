import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { theme } from '../../styles/theme';
import { passwordRules } from '../../../domain/auth/passwordPolicy';
import { themed } from '../../styles/themeRuntime';

interface PasswordStrengthMeterProps {
  password: string;
}

const SEGMENTS = 4;

/**
 * One check mark for the whole meter: a filled circle with a check when the rule is met, an outlined circle when
 * not. Both share the same box and stroke, so the states look the same size (the Flaticon glyphs do not: their
 * check is drawn smaller inside its box).
 */
const RuleIcon: React.FC<{ met: boolean; color: string; size: number }> = ({ met, color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    {met ? (
      <>
        <Circle cx="12" cy="12" r="12" fill={color} />
        <Path
          d="M6.8 12.4l3.4 3.4 7-7.4"
          stroke={theme.colors.textOnPrimary}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </>
    ) : (
      <Circle cx="12" cy="12" r="10.5" stroke={color} strokeWidth={2} fill="none" />
    )}
  </Svg>
);

const LEVELS = themed(() => [
  { label: '', color: theme.colors.grayMedium },
  { label: 'Débil', color: theme.colors.error },
  { label: 'Regular', color: theme.colors.warning },
  { label: 'Fuerte', color: theme.colors.primaryActive },
  { label: 'Muy fuerte', color: theme.colors.success },
]);

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
          {score >= 3 && <RuleIcon met size={14} color={level.color} />}
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
            <RuleIcon
              met={rule.met}
              size={17}
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
  // two chips per row: four in one row cannot fit "Mayúscula" on a phone
  flexBasis: '48%',
  flexGrow: 1,
  minWidth: 0,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 5,
  paddingHorizontal: theme.spacing.sm,
  paddingVertical: theme.spacing.xs,
  borderRadius: theme.borderRadius.full,
};

const chipTextStyle: TextStyle = {
  ...theme.textStyles.label,
  flexShrink: 1,
};
