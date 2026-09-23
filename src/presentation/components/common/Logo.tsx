import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native'
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../styles/colors';

type LogoType = 'isotipo';

// Por ahora solo 'light'; 'dark' se agrega cuando exista el tema oscuro
type LogoTheme = 'light';

interface LogoProps {
  type?: LogoType;
  theme?: LogoTheme;
 size?: number;
  style?: StyleProp<ViewStyle>;
}

// Trazos del isotipo (viewBox 0 0 64 64), extraídos de assets/logos/isotipo-claro.svg
const DROP_PATH = 'M32 5C32 5 14 23.5 14 38A18 18 0 1 0 50 38C50 31 47.5 24.5 44 18.5';
const WAVE_TOP_PATH = 'M21 40q5.5-5 11 0t11 0';
const WAVE_BOTTOM_PATH = 'M23.5 48q4.25-4 8.5 0t8.5 0';

export const Logo: React.FC<LogoProps> = ({ size = 48, style }) => {
  return (
    <View style={style} accessible accessibilityRole="image" accessibilityLabel="Cuida Tu Agua">
      <Svg width={size} height={size} viewBox="0 0 64 64">
        {/* Gota */}
        <Path
          d={DROP_PATH}
          stroke={colors.textPrimary}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
        />
        {/* Ola superior */}
        <Path
          d={WAVE_TOP_PATH}
          stroke={colors.primary}
          strokeWidth={3.4}
          strokeLinecap="round"
          fill="none"
        />
        {/* Ola inferior */}
        <Path
          d={WAVE_BOTTOM_PATH}
          stroke={colors.secondary}
          strokeWidth={3.4}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
};
