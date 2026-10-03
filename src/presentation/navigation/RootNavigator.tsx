import React from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { SplashScreen } from '../screens/SplashScreen';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

export const RootNavigator: React.FC = () => {
  const { status } = useAuth();

  if (status === 'loading') return <SplashScreen />;
  return status === 'signedIn' ? <MainNavigator /> : <AuthNavigator />;
};
