import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  ViewStyle,
  TextStyle,
  StyleProp,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../styles/theme';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  editable?: boolean;
  error?: string;
  icon?: React.ReactNode; // string (emoji) o componente, p. ej. <Ionicons />
  leftIcon?: React.ReactNode; // ícono decorativo a la izquierda del texto
  onIconPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const containerBase: ViewStyle = {
  marginBottom: theme.spacing.lg,
};

const labelBase: TextStyle = {
  ...theme.textStyles.label,
  color: theme.colors.textPrimary,
  marginBottom: theme.spacing.sm,
};

const FIELD_HEIGHT = 54;
const BORDER = 1;
const BORDER_FOCUSED = 2;

const fieldBaseStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  height: FIELD_HEIGHT,
  paddingHorizontal: theme.spacing.lg,
  borderRadius: theme.borderRadius.small,
  borderWidth: BORDER,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.surface,
  gap: theme.spacing.md,
};

const textInputStyle: TextStyle = {
  height: '100%',
  fontFamily: theme.textStyles.body.fontFamily,
  fontSize: theme.typography.sizes.body,
  color: theme.colors.textPrimary,
  paddingVertical: 0,
  paddingHorizontal: 0,
  margin: 0,
  textAlignVertical: 'center',
  includeFontPadding: false, // Android: quita el espacio extra que empuja el texto hacia abajo
};

const textAreaStyle: ViewStyle = {
  flex: 1,
  height: '100%',
  justifyContent: 'center',
};

const placeholderWrapperStyle: ViewStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  justifyContent: 'center',
};

const placeholderTextStyle: TextStyle = {
  fontFamily: theme.textStyles.body.fontFamily,
  fontSize: theme.typography.sizes.body,
  color: theme.colors.textMuted,
  includeFontPadding: false,
};

const errorTextStyle: TextStyle = {
  ...theme.textStyles.caption,
  color: theme.colors.error,
  marginTop: theme.spacing.sm,
};

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  editable = true,
  error,
  icon,
  leftIcon,
  onIconPress,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const fieldStyle: StyleProp<ViewStyle> = [
    fieldBaseStyle,
    isFocused && {
      borderColor: theme.colors.primary,
      borderWidth: BORDER_FOCUSED,
      // compensa el borde más grueso para que el contenido no se mueva
      paddingHorizontal: theme.spacing.lg - (BORDER_FOCUSED - BORDER),
    },
    !!error && { borderColor: theme.colors.error },
    !editable && { backgroundColor: theme.colors.grayLight },
  ];

  return (
    <View style={[containerBase, style]}>
      {label && <Text style={labelBase}>{label}</Text>}

      <View style={fieldStyle}>
        {leftIcon && <View pointerEvents="none">{leftIcon}</View>}

        <View style={textAreaStyle}>
          {!value && !!placeholder && (
            <View pointerEvents="none" style={placeholderWrapperStyle}>
              <Text style={placeholderTextStyle} numberOfLines={1}>
                {placeholder}
              </Text>
            </View>
          )}
          <TextInput
            style={[textInputStyle, !editable && { color: theme.colors.textMuted }]}
            accessibilityLabel={label ?? placeholder}
            selectionColor={theme.colors.primary}
            cursorColor={theme.colors.primary}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            editable={editable}
            autoCapitalize={keyboardType === 'email-address' ? 'none' : undefined}
            underlineColorAndroid="transparent"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>

        {icon && (
          <TouchableOpacity onPress={onIconPress} hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}>
            {typeof icon === 'string' ? <Text style={{ fontSize: 20 }}>{icon}</Text> : icon}
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={errorTextStyle}>{error}</Text>}
    </View>
  );
};
