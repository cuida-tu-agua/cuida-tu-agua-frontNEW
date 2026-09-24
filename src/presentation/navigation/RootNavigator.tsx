import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../core/auth/AuthContext';
import { SplashScreen } from '../screens/SplashScreen';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0096C7" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  return <MainNavigator />;
};