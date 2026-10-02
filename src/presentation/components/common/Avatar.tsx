import React from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { theme } from '../../styles/theme';

interface AvatarProps {
  uri: string | null;
  firstName: string;
  lastName: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ uri, firstName, lastName, size = 48 }) => {
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={shape} contentFit="cover" accessibilityLabel="Foto de perfil" />;
  }

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  return (
    <View style={[circleStyle, shape]} accessibilityLabel={`Iniciales ${initials}`}>
      <Text style={[initialsStyle, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
};

const circleStyle: ViewStyle = {
  backgroundColor: theme.colors.infoBg,
  alignItems: 'center',
  justifyContent: 'center',
};

const initialsStyle: TextStyle = {
  fontFamily: theme.typography.fontFamily.manrope,
  fontWeight: '800',
  color: theme.colors.primaryActive,
};
