import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import QRCode from 'qrcode';

interface QrCodeProps {
  value: string;
  size?: number;
  color?: string;
  background?: string;
}

/** A QR drawn with SVG (same on web and phone). The modules are joined into ONE path: a few thousand rectangles would be slow. */
export const QrCode: React.FC<QrCodeProps> = ({ value, size = 96, color = '#000000', background = '#FFFFFF' }) => {
  const { path, count } = useMemo(() => {
    const qr = QRCode.create(value, { errorCorrectionLevel: 'M' });
    const modules = qr.modules.size;
    let d = '';
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        if (qr.modules.get(row, col)) d += `M${col} ${row}h1v1h-1z`;
      }
    }
    return { path: d, count: modules };
  }, [value]);

  return (
    <View accessible accessibilityRole="image" accessibilityLabel="Código QR de la etiqueta">
      <Svg width={size} height={size} viewBox={`-2 -2 ${count + 4} ${count + 4}`}>
        <Rect x={-2} y={-2} width={count + 4} height={count + 4} fill={background} />
        <Path d={path} fill={color} />
      </Svg>
    </View>
  );
};
