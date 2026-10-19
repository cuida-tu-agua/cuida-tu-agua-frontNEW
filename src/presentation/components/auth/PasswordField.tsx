import React, { useState } from 'react';
import { TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Input } from '../common/Input';
import { theme } from '../../styles/theme';
import { EyeIcon } from './EyeIcon';
import { UIcon } from './UIcon';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  onBlur?: () => void;
  purpose?: 'current' | 'new';
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: () => void;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  value,
  onChangeText,
  error,
  hint,
  placeholder = '••••••••',
  onBlur,
  purpose = 'current',
  returnKeyType,
  onSubmitEditing,
}) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <Input
      label={label}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      secureTextEntry={!visible}
      error={error}
      hint={hint}
      maxLength={128}
      autoCapitalize="none"
      autoComplete={purpose === 'new' ? 'new-password' : 'current-password'}
      textContentType={purpose === 'new' ? 'newPassword' : 'password'}
      returnKeyType={returnKeyType}
      onSubmitEditing={onSubmitEditing}
      leftIcon={<UIcon name="lock" size={20} color={theme.colors.textMuted} />}
      icon={
        <EyeIcon
          crossed={visible}
          size={22}
          color={theme.colors.textPrimary}
          accessibilityLabel={visible ? t('password.hide') : t('password.show')}
        />
      }
      onIconPress={() => setVisible((v) => !v)}
    />
  );
};
