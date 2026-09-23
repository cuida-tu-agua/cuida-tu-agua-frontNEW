import React from 'react';
import { AppRegistry, SafeAreaView, View, Button } from 'react-native';
import { SplashScreen } from './src/presentation/screens/SplashScreen';
import { LoginScreen } from './src/presentation/screens/auth/LoginScreen';
import { RegisterScreen } from './src/presentation/screens/auth/RegisterScreen';

type ScreenName = 'splash' | 'login' | 'register';

export default function App() {
  const [screen, setScreen] = React.useState<ScreenName>('splash');
  const [showDevButtons, setShowDevButtons] = React.useState(false);


  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return <SplashScreen onFinish={() => {setScreen('login'); setShowDevButtons(true);}} />;
      case 'login':
        return (
          <LoginScreen
            onLoginPress={(email, password) => console.log('Login:', email, password)}
            onRegisterPress={() => setScreen('register')}
            onForgotPasswordPress={() => console.log('Forgot')}
          />
        );
      case 'register':
        return (
          <RegisterScreen
            onRegisterPress={(name, email, password) => console.log('Register:', name, email, password)}
            onLoginPress={() => setScreen('login')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {renderScreen()}
      {showDevButtons && (
        <View style={{ position: 'absolute', bottom: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 8, padding: 10, gap: 8 }}>
          <Button title="Splash" onPress={() => setScreen('splash')} color="#0096C7" />
          <Button title="Login" onPress={() => setScreen('login')} color="#0096C7" />
          <Button title="Register" onPress={() => setScreen('register')} color="#0096C7" />
        </View>
      )}
    </SafeAreaView>
  );
}

AppRegistry.registerComponent('save-your-water', () => App);