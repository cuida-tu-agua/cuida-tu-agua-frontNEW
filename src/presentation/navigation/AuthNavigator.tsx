import React, { useState } from 'react';
import { View } from 'react-native';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { useAuth } from '../../core/auth/AuthContext';

type AuthScreenName = 'login' | 'register';

export const AuthNavigator: React.FC = () => {
  const [screen, setScreen] = useState<AuthScreenName>('login');
  const { login, register } = useAuth();

  return (
    <View style={{ flex: 1 }}>
      {screen === 'login' ? (
        <LoginScreen
          onLoginPress={login}
          onRegisterPress={() => setScreen('register')}
          onForgotPasswordPress={() => console.log('TODO: Password reset')}
        />
      ) : (
        <RegisterScreen
          onRegisterPress={register}
          onLoginPress={() => setScreen('login')}
        />
      )}
    </View>
  );
};