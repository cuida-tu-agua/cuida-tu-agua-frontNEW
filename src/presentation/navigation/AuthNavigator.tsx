import React from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { GuestScreen } from '../screens/guest/GuestScreen';
import { LegalScreen } from '../screens/legal/LegalScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { VerifyEmailScreen } from '../screens/auth/VerifyEmailScreen';
import { theme } from '../styles/theme';
import { AuthStackParamList } from './types';
import { themeAware } from '../theme/ThemeProvider';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  const { t } = useTranslation(); // re-draws the title of the legal page when the language changes
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Login" component={themeAware(LoginScreen)} />
      <Stack.Screen name="Register" component={themeAware(RegisterScreen)} />
      <Stack.Screen name="VerifyEmail" component={themeAware(VerifyEmailScreen)} />
      <Stack.Screen name="ForgotPassword" component={themeAware(ForgotPasswordScreen)} />
      <Stack.Screen name="ResetPassword" component={themeAware(ResetPasswordScreen)} />
      <Stack.Screen name="Guest" component={themeAware(GuestScreen)} />
      {/* The web draws its own header; the phone app gets the native bar to go back */}
      <Stack.Screen name="Legal" component={themeAware(LegalScreen)} options={{ headerShown: Platform.OS !== 'web', title: t('legal.title') }} />
    </Stack.Navigator>
  );
};
