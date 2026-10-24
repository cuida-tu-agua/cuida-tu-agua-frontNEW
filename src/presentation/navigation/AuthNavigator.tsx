import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { GuestScreen } from '../screens/guest/GuestScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { VerifyEmailScreen } from '../screens/auth/VerifyEmailScreen';
import { theme } from '../styles/theme';
import { AuthStackParamList } from './types';
import { themeAware } from '../theme/ThemeProvider';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => (
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
  </Stack.Navigator>
);
