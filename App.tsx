import React from 'react';
import { AppRegistry } from 'react-native';
import { AuthProvider } from './src/core/auth/AuthContext';
import { RootNavigator } from './src/presentation/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

AppRegistry.registerComponent('save-your-water', () => App);