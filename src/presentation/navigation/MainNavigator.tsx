import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlaceDashboardScreen } from '../screens/dashboard/PlaceDashboardScreen';
import { DeviceWifiSetupScreen } from '../screens/devices/DeviceWifiSetupScreen';
import { LinkDeviceScreen } from '../screens/devices/LinkDeviceScreen';
import { PlaceDeviceScreen } from '../screens/devices/PlaceDeviceScreen';
import { CreatePlaceScreen } from '../screens/places/CreatePlaceScreen';
import { EditPlaceScreen } from '../screens/places/EditPlaceScreen';
import { NotificationPreferencesScreen } from '../screens/notifications/NotificationPreferencesScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { PlacesScreen } from '../screens/places/PlacesScreen';
import { AdminMetricsScreen } from '../screens/admin/AdminMetricsScreen';
import { AdminTipsScreen } from '../screens/admin/AdminTipsScreen';
import { AdminUsersScreen } from '../screens/admin/AdminUsersScreen';
import { ChangePasswordScreen } from '../screens/profile/ChangePasswordScreen';
import { DeleteAccountScreen } from '../screens/profile/DeleteAccountScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { PlaceTariffScreen } from '../screens/tariffs/PlaceTariffScreen';
import { TipsScreen } from '../screens/tips/TipsScreen';
import { ValveHistoryScreen } from '../screens/valve/ValveHistoryScreen';
import { theme } from '../styles/theme';
import { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="Places"
    screenOptions={{
      // The web draws its own page header (PageHeader) under the menu; the native bar is for the phone app
      headerShown: Platform.OS !== 'web',
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
    <Stack.Screen name="PlaceDevice" component={PlaceDeviceScreen} options={{ title: 'Medidor' }} />
    <Stack.Screen name="LinkDevice" component={LinkDeviceScreen} options={{ title: 'Vincular medidor' }} />
    <Stack.Screen name="DeviceWifiSetup" component={DeviceWifiSetupScreen} options={{ title: 'WiFi del medidor' }} />
    <Stack.Screen name="PlaceDashboard" component={PlaceDashboardScreen} options={{ title: 'Panel' }} />
    <Stack.Screen name="ValveHistory" component={ValveHistoryScreen} options={{ title: 'Historial de la válvula' }} />
    <Stack.Screen name="PlaceTariff" component={PlaceTariffScreen} options={{ title: 'Tarifa del agua' }} />
    <Stack.Screen name="Tips" component={TipsScreen} options={{ title: 'Consejos de ahorro' }} />
    <Stack.Screen name="AdminTips" component={AdminTipsScreen} options={{ title: 'Recomendaciones' }} />
    <Stack.Screen name="AdminMetrics" component={AdminMetricsScreen} options={{ title: 'Resumen' }} />
    <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Usuarios' }} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notificaciones' }} />
    <Stack.Screen
      name="NotificationPreferences"
      component={NotificationPreferencesScreen}
      options={{ title: 'Preferencias de notificaciones' }}
    />
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mi perfil' }} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Cambiar contraseña' }} />
    <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ title: 'Eliminar cuenta' }} />
  </Stack.Navigator>
);
