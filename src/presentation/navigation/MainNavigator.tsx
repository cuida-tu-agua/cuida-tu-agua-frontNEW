import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CreatePlaceScreen } from '../screens/places/CreatePlaceScreen';
import { EditPlaceScreen } from '../screens/places/EditPlaceScreen';
import { PlacesScreen } from '../screens/places/PlacesScreen';
import { theme } from '../styles/theme';
import { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="Places"
    screenOptions={{
      headerTintColor: theme.colors.primary,
      headerTitleStyle: { color: theme.colors.textPrimary },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: theme.colors.surface },
      contentStyle: { backgroundColor: theme.colors.background },
      headerBackTitle: 'Atrás',
    }}
  >
    <Stack.Screen name="Places" component={PlacesScreen} options={{ headerShown: false }} />
    <Stack.Screen name="CreatePlace" component={CreatePlaceScreen} options={{ title: 'Registrar lugar' }} />
    <Stack.Screen name="EditPlace" component={EditPlaceScreen} options={{ title: 'Editar lugar' }} />
  </Stack.Navigator>
);
