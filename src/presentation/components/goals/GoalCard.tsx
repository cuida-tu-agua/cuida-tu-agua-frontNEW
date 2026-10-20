import React from 'react';
import { ActivityIndicator, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../../i18n/format';
import { AppError } from '../../../domain/common/AppError';
import { formatVolume } from '../../../domain/consumption/consumptionFormat';
import {
  daysLeftLabel,
  formatPercent,
  GOAL_STATUS_LABELS,
  GoalProgress,
  GoalStatus,
  monthName,
  overLiters,
  progressFraction,
} from '../../../domain/goals/Goal';
import { MeasurementUnit } from '../../../domain/places/Place';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';
import { Banner } from '../common/Banner';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface GoalCardProps {
  goal: GoalProgress | null;
  loading: boolean;
  error: AppError | null;
  unit: MeasurementUnit;
  /** Opens the dialog to set or change the goal. */
  onEdit: () => void;
}

/** The color of each state, read from the current theme every time (it works in the four themes). */
const statusColors = (status: GoalStatus) =>
  status === 'EXCEEDED'
    ? { fg: theme.colors.error, bg: theme.colors.errorBg }
    : status === 'WARNING'
      ? { fg: theme.colors.warning, bg: theme.colors.warningBg }
      : { fg: theme.colors.success, bg: theme.colors.successBg };

/**
 * HU-023/024: the monthly goal of the place. Without a goal it invites to create one (and still says how much was used);
 * with a goal it shows "used of goal", a bar that turns yellow at 80 % and red at 100 %, and the days left.
 */
export const GoalCard: React.FC<GoalCardProps> = ({ goal, loading, error, unit, onEdit }) => {
  const { t } = useTranslation();
  const month = goal ? monthName(goal.monthStart) : '';

  return (
    <Card variant="outlined" style={cardStyle}>
      <View style={headerStyle}>
        <View style={iconStyle}>
          <Ionicons name="flag-outline" size={22} color={theme.colors.primary} />
        </View>
        <Text style={titleStyle}>{month ? t('goals.titleMonth', { month }) : t('goals.title')}</Text>
        {goal?.hasGoal && goal.status && (
          <View style={[pillStyle, { backgroundColor: statusColors(goal.status).bg, borderColor: statusColors(goal.status).fg }]}>
            <Text style={pillTextStyle}>{GOAL_STATUS_LABELS[goal.status]}</Text>
          </View>
        )}
      </View>

      {!!error && <Banner tone="warning" message={t('goals.failed', { reason: error.message })} />}

      {!goal ? (
        <View style={centerStyle}>
          {loading ? <ActivityIndicator color={theme.colors.primary} /> : <Text style={mutedStyle}>{t('consumption.noData')}</Text>}
        </View>
      ) : !goal.hasGoal || goal.targetLiters === null ? (
        <View style={inviteStyle}>
          <Text style={inviteTitleStyle}>{t('goals.noGoalTitle', { month })}</Text>
          <Text style={mutedStyle}>{t('goals.noGoalText', { consumed: formatVolume(goal.consumedLiters, unit) })}</Text>
          <Button label={t('goals.define')} onPress={onEdit} size="medium" />
        </View>
      ) : (
        <>
          <View
            style={amountRowStyle}
            accessible
            accessibilityLabel={t('goals.usedA11y', {
              consumed: formatVolume(goal.consumedLiters, unit),
              target: formatVolume(goal.targetLiters, unit),
            })}
          >
            <Text style={amountStyle}>{formatVolume(goal.consumedLiters, unit)}</Text>
            <Text style={ofStyle}>{t('goals.usedOf', { target: formatVolume(goal.targetLiters, unit) })}</Text>
          </View>

          <View
            style={trackStyle}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: Math.min(goal.percentage ?? 0, 100) }}
            accessibilityLabel={t('goals.percentA11y', { value: formatNumber(goal.percentage ?? 0, 1) })}
          >
            <View
              style={[
                fillStyle,
                {
                  width: `${progressFraction(goal.percentage) * 100}%`,
                  backgroundColor: statusColors(goal.status ?? 'ON_TRACK').fg,
                },
              ]}
            />
          </View>

          <View style={rowStyle}>
            <Text style={percentStyle}>{formatPercent(goal.percentage)}</Text>
            <Text style={mutedStyle}>{daysLeftLabel(goal.daysLeft)}</Text>
          </View>

          <Text style={detailStyle}>
            {goal.status === 'EXCEEDED'
              ? t('goals.over', { volume: formatVolume(overLiters(goal), unit) })
              : t('goals.remaining', { volume: formatVolume(goal.remainingLiters ?? 0, unit) })}
          </Text>

          <Button label={t('goals.change')} onPress={onEdit} variant="secondary" size="small" style={{ alignSelf: 'flex-start' }} />
        </>
      )}
    </Card>
  );
};

const cardStyle: ViewStyle = { gap: theme.spacing.sm };
const headerStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md };
const iconStyle: ViewStyle = themed(() => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: theme.colors.infoBg,
  alignItems: 'center',
  justifyContent: 'center',
}));
const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, color: theme.colors.textPrimary, flex: 1 }));
const pillStyle: ViewStyle = {
  paddingHorizontal: theme.spacing.sm,
  paddingVertical: 4,
  borderRadius: theme.borderRadius.full,
  borderWidth: 1,
};
const pillTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, color: theme.colors.textPrimary }));
const centerStyle: ViewStyle = { alignItems: 'center', paddingVertical: theme.spacing.xl };
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
const inviteStyle: ViewStyle = { gap: theme.spacing.md, paddingVertical: theme.spacing.sm };
const inviteTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, color: theme.colors.textPrimary }));
const amountRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: theme.spacing.sm };
const amountStyle: TextStyle = themed(() => ({ ...theme.textStyles.h2, color: theme.colors.textPrimary }));
const ofStyle: TextStyle = themed(() => ({ ...theme.textStyles.body, color: theme.colors.textSecondary }));
const trackStyle: ViewStyle = themed(() => ({
  height: 12,
  borderRadius: 6,
  overflow: 'hidden',
  backgroundColor: theme.colors.grayLight,
}));
const fillStyle: ViewStyle = { height: '100%', borderRadius: 6 };
const rowStyle: ViewStyle = { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing.md };
const percentStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontWeight: '800', color: theme.colors.textPrimary }));
const detailStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary }));
