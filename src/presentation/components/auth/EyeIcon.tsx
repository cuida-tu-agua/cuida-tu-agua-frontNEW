import React from 'react';
import { UIcon } from './UIcon';

interface EyeIconProps {
  crossed?: boolean;
  size?: number;
  color?: string;
  accessibilityLabel?: string;
}

/** Ojo para mostrar/ocultar contraseña (Flaticon UIcons: eye / eye-crossed). */
export const EyeIcon: React.FC<EyeIconProps> = ({ crossed = false, size = 22, ...rest }) => (
  <UIcon name={crossed ? 'eye-crossed' : 'eye'} size={size} {...rest} />
);
