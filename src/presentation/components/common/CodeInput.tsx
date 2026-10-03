import React, { useRef, useState } from 'react';
import { Pressable, Text, TextInput, TextStyle, View, ViewStyle } from 'react-native';
import { theme } from '../../styles/theme';

interface CodeInputProps {
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  length?: number;
  error?: string;
  editable?: boolean;
}

export const CodeInput: React.FC<CodeInputProps> = ({
  value,
  onChange,
  onComplete,
  length = 6,
  error,
  editable = true,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const handleChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, length);
    onChange(digits);
    if (digits.length === length && value.length !== length) onComplete?.(digits);
  };

  return (
    <View style={wrapperStyle}>
      <Pressable
        style={rowStyle}
        onPress={() => inputRef.current?.focus()}
        accessibilityRole="none"
        accessibilityLabel={`Código de ${length} dígitos. ${value.length} escritos.`}
      >
        {Array.from({ length }).map((_, index) => {
          const isCurrent = focused && index === Math.min(value.length, length - 1);
          return (
            <View
              key={index}
              style={[
                boxStyle,
                isCurrent && { borderColor: theme.colors.primary, borderWidth: 2 },
                !!error && { borderColor: theme.colors.error },
                !editable && { backgroundColor: theme.colors.grayLight },
              ]}
            >
              <Text style={digitStyle}>{value[index] ?? ''}</Text>
            </View>
          );
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        editable={editable}
        autoFocus
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={hiddenInputStyle}
        caretHidden
      />

      {!!error && (
        <Text style={errorStyle} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
};

const wrapperStyle: ViewStyle = { marginBottom: theme.spacing.lg };

const rowStyle: ViewStyle = { flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.sm };

const boxStyle: ViewStyle = {
  flex: 1,
  maxWidth: 52,
  height: 60,
  borderRadius: theme.borderRadius.small,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.surface,
  alignItems: 'center',
  justifyContent: 'center',
};

const digitStyle: TextStyle = {
  fontFamily: theme.typography.fontFamily.monospace, // codes are data: IBM Plex Mono
  fontSize: 26,
  fontWeight: '700',
  color: theme.colors.textPrimary,
};

// Invisible but focusable (opacity 0 keeps paste / autofill working)
const hiddenInputStyle: TextStyle = { position: 'absolute', opacity: 0, width: 1, height: 1 };

const errorStyle: TextStyle = {
  ...theme.textStyles.caption,
  color: theme.colors.error,
  marginTop: theme.spacing.sm,
  textAlign: 'center',
};
