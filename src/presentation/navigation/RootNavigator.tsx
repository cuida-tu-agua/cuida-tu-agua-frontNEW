import React from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { PushBridge } from '../push/PushBridge';
import { SplashScreen } from '../screens/SplashScreen';
import { AppShell } from './AppShell';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

export const RootNavigator: React.FC = () => {
  const { status } = useAuth();

  if (status === 'loading') return <SplashScreen />;
  return status === 'signedIn' ? (
    <AppShell>
      <MainNavigator />
      <PushBridge />
    </AppShell>
  ) : (
    <AuthNavigator />
  );
};
