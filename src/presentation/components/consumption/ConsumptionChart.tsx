import React, { useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, TextStyle, View, ViewStyle } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { ConsumptionBucket, ConsumptionPeriod } from '../../../domain/consumption/Consumption';
import { bucketLabel, bucketTooltip, formatVolume, maxLiters, shouldLabel } from '../../../domain/consumption/consumptionFormat';
import { MeasurementUnit } from '../../../domain/places/Place';
import { theme } from '../../styles/theme';

interface ConsumptionChartProps {
  buckets: ConsumptionBucket[];
  period: ConsumptionPeriod;
  unit: MeasurementUnit;
  height?: number;
}

const LABEL_SPACE = 20;
const TOP_SPACE = 16;

/**
 * HU-017: bars by hour (day) or by day (week and month). Tapping a bar on a phone, or hovering it with the
 * mouse on the web, shows the exact value of that interval above the chart.
 */
export const ConsumptionChart: React.FC<ConsumptionChartProps> = ({ buckets, period, unit, height = 180 }) => {
  const [width, setWidth] = useState(0);
  // The selected bar is remembered by its start date, so changing period or reloading never leaves a stale selection
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width));

  const selected = buckets.find((b) => b.start === selectedStart) ?? null;
  const max = maxLiters(buckets);
  const plotHeight = height - LABEL_SPACE - TOP_SPACE;
  const slot = buckets.length ? width / buckets.length : 0;
  const barWidth = Math.max(2, slot * 0.64);
  const peakIndex = buckets.reduce((best, b, i) => (b.liters > buckets[best].liters ? i : best), 0);

  return (
    <View>
      <Text style={selected ? tooltipStyle : hintStyle} accessibilityLiveRegion="polite">
        {selected ? bucketTooltip(selected, period, unit) : 'Toca una barra para ver su valor'}
      </Text>

      <View onLayout={onLayout} style={{ height }}>
        {width > 0 && (
          <>
            <Svg width={width} height={height}>
              <Line
                x1={0}
                x2={width}
                y1={TOP_SPACE + plotHeight}
                y2={TOP_SPACE + plotHeight}
                stroke={theme.colors.border}
                strokeWidth={1}
              />
              {buckets.map((bucket, i) => {
                const barHeight = bucket.liters > 0 ? Math.max(2, (bucket.liters / max) * plotHeight) : 0;
                const x = i * slot + (slot - barWidth) / 2;
                const isPeak = i === peakIndex && bucket.liters > 0;
                // With a selection, only that bar is highlighted; without one, the highest bar is
                const highlighted = selected ? bucket.start === selected.start : isPeak;
                return (
                  <React.Fragment key={bucket.start}>
                    <Rect
                      x={x}
                      y={TOP_SPACE + plotHeight - barHeight}
                      width={barWidth}
                      height={barHeight}
                      rx={Math.min(4, barWidth / 2)}
                      fill={highlighted ? theme.colors.primary : theme.colors.secondary}
                    />
                    {isPeak && !selected && (
                      <SvgText
                        x={Math.min(Math.max(x + barWidth / 2, 24), width - 24)}
                        y={TOP_SPACE + plotHeight - barHeight - 4}
                        fontSize={10}
                        fill={theme.colors.textPrimary}
                        textAnchor="middle"
                      >
                        {formatVolume(bucket.liters, unit)}
                      </SvgText>
                    )}
                    {shouldLabel(i, buckets.length, period) && (
                      <SvgText
                        x={x + barWidth / 2}
                        y={height - 4}
                        fontSize={11}
                        fill={theme.colors.textMuted}
                        textAnchor="middle"
                      >
                        {bucketLabel(bucket, period)}
                      </SvgText>
                    )}
                  </React.Fragment>
                );
              })}
            </Svg>

            {/* One invisible touch area per bar, full height, so thin bars are easy to hit and zero bars can be read too */}
            <View style={touchRowStyle}>
              {buckets.map((bucket) => (
                <Pressable
                  key={bucket.start}
                  style={{ flex: 1 }}
                  accessibilityRole="button"
                  accessibilityLabel={bucketTooltip(bucket, period, unit)}
                  onPress={() => setSelectedStart((current) => (current === bucket.start ? null : bucket.start))}
                  onHoverIn={() => setSelectedStart(bucket.start)}
                />
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const touchRowStyle: ViewStyle = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row' };
const tooltipStyle: TextStyle = { ...theme.textStyles.label, color: theme.colors.primary, textAlign: 'center', marginBottom: theme.spacing.xs };
const hintStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textMuted, textAlign: 'center', marginBottom: theme.spacing.xs };
