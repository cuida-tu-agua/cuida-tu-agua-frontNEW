import React from 'react';
import { View, Button as NativeButton, StyleSheet } from 'react-native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { CreatePlaceScreen } from '../screens/places/CreatePlaceScreen';
import { EditPlaceScreen } from '../screens/places/EditPlaceScreen';
import { Button } from '../components/common/Button';
import { useAuth } from '../../core/auth/AuthContext';
import { theme } from '../styles/theme';
import { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

const HomeScreen: React.FC<NativeStackScreenProps<MainStackParamList, 'Home'>> = ({ navigation }) => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <DashboardScreen userName={user?.email || 'Usuario'} />
      <View style={styles.footer}>
        <Button label="+ Registrar lugar" size="medium" onPress={() => navigation.navigate('CreatePlace')} />
        <NativeButton title="Logout" onPress={logout} color="#0096C7" />
      </View>
    </View>
  );
};

export const MainNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerTintColor: theme.colors.primary,
      headerTitleStyle: { color: theme.colors.textPrimary },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: theme.colors.surface },
      contentStyle: { backgroundColor: theme.colors.background },
      headerBackTitle: 'Atrás',
    }}
  >
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="CreatePlace" component={CreatePlaceScreen} options={{ title: 'Registrar lugar' }} />
    <Stack.Screen name="EditPlace" component={EditPlaceScreen} options={{ title: 'Editar lugar' }} />
  </Stack.Navigator>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    padding: 20,
    gap: 12,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});