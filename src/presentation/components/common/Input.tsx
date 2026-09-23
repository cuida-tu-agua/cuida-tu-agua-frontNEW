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
  icon?: string;
  onIconPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const containerBase: ViewStyle = {
  marginBottom: theme.spacing.lg,
};

const labelBase: TextStyle = {
  ...theme.textStyles.label,
  color: theme.colors.textMuted,
  marginBottom: theme.spacing.sm,
};

const inputBaseStyle: TextStyle = {
  ...theme.textStyles.body,
  paddingHorizontal: theme.spacing.lg,
  paddingVertical: theme.spacing.md,
  borderRadius: theme.borderRadius.small,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.surface,
  color: theme.colors.textPrimary,
  height: 56,
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
  onIconPress,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputStyle: StyleProp<TextStyle> = [
    inputBaseStyle,
    isFocused && {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    error && {
      borderColor: theme.colors.error,
    },
    !editable && {
      backgroundColor: theme.colors.grayLight,
      color: theme.colors.textMuted,
    },
  ];

  return (
    <View style={[containerBase, style]}>
      {label && <Text style={labelBase}>{label}</Text>}

      <View style={{ position: 'relative' }}>
        <TextInput
          style={inputStyle}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {icon && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: theme.spacing.lg,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
            }}
            onPress={onIconPress}
          >
            <Text style={{ fontSize: 20 }}>{icon}</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={errorTextStyle}>{error}</Text>}
    </View>
  );
};