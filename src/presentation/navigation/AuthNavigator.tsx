import React, { useState } from 'react';
import { View } from 'react-native';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { SuccessModal } from '../components/common/SuccessModal';
import { useAuth } from '../../core/auth/AuthContext';

type AuthScreenName = 'login' | 'register';

export const AuthNavigator: React.FC = () => {
  const [screen, setScreen] = useState<AuthScreenName>('login');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { login, register } = useAuth();

  const handleRegister = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      //  Registrar el usuario en la API
      await register(firstName, lastName, email, password);

      setShowSuccessModal(true);

      await new Promise(resolve => setTimeout(resolve, 3000));

      await login(email, password);
    } catch (error) {
      setShowSuccessModal(false);
      throw error;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SuccessModal
        visible={showSuccessModal}
        message="Se ha registrado correctamente"
        onDismiss={() => setShowSuccessModal(false)}
        autoCloseDuration={3000}
      />
      {screen === 'login' ? (
        <LoginScreen
          onLoginPress={login}
          onRegisterPress={() => setScreen('register')}
          onForgotPasswordPress={() => console.log('TODO: Password reset')}
        />
      ) : (
        <RegisterScreen
          onRegisterPress={handleRegister}
          onLoginPress={() => setScreen('login')}
        />
      )}
    </View>
  );
};