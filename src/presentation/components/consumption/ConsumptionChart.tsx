import React, { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { ConsumptionBucket, ConsumptionPeriod } from '../../../domain/consumption/Consumption';
import { bucketLabel, formatVolume, maxLiters, shouldLabel } from '../../../domain/consumption/consumptionFormat';
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

export const ConsumptionChart: React.FC<ConsumptionChartProps> = ({ buckets, period, unit, height = 180 }) => {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width));

  const max = maxLiters(buckets);
  const plotHeight = height - LABEL_SPACE - TOP_SPACE;
  const slot = buckets.length ? width / buckets.length : 0;
  const barWidth = Math.max(2, slot * 0.64);
  const peakIndex = buckets.reduce((best, b, i) => (b.liters > buckets[best].liters ? i : best), 0);

  return (
    <View
      onLayout={onLayout}
      style={{ height }}
      accessible
      accessibilityLabel={`Gráfica de consumo. Mayor valor: ${formatVolume(max, unit)}.`}
    >
      {width > 0 && (
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
            return (
              <React.Fragment key={bucket.start}>
                <Rect
                  x={x}
                  y={TOP_SPACE + plotHeight - barHeight}
                  width={barWidth}
                  height={barHeight}
                  rx={Math.min(4, barWidth / 2)}
                  fill={isPeak ? theme.colors.primary : theme.colors.secondary}
                />
                {isPeak && (
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
      )}
    </View>
  );
};
