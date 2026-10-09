import React from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../core/auth/AuthContext';
import { isAdmin } from '../../../domain/admin/Admin';
import { theme } from '../../styles/theme';

/**
 * The administration screens are only for the ADMIN role. The menu already hides them from everybody else, and the
 * servers refuse the calls anyway (403): this is for someone who reaches the address by hand, so they see a clear
 * message instead of an error.
 */
export const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (isAdmin(user?.roles)) return <>{children}</>;

  return (
    <View style={centerStyle}>
      <Ionicons name="lock-closed-outline" size={44} color={theme.colors.textMuted} />
      <Text style={titleStyle}>Solo para administradores</Text>
      <Text style={textStyle}>Tu cuenta no tiene permisos para ver esta sección.</Text>
    </View>
  );
};

const centerStyle: ViewStyle = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing.md,
  padding: theme.spacing.xl,
  backgroundColor: theme.colors.background,
};
const titleStyle: TextStyle = { ...theme.textStyles.h2, fontSize: 20, color: theme.colors.textPrimary, textAlign: 'center' };
const textStyle: TextStyle = { ...theme.textStyles.caption, color: theme.colors.textSecondary, textAlign: 'center' };
