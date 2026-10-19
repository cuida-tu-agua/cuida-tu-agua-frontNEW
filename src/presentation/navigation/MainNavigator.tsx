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
import { AdminDeviceCreateScreen } from '../screens/admin/AdminDeviceCreateScreen';
import { AdminDeviceDetailScreen } from '../screens/admin/AdminDeviceDetailScreen';
import { AdminDevicesScreen } from '../screens/admin/AdminDevicesScreen';
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
import { themeAware } from '../theme/ThemeProvider';

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
    <Stack.Screen name="Places" component={themeAware(PlacesScreen)} options={{ headerShown: false }} />
    <Stack.Screen name="CreatePlace" component={themeAware(CreatePlaceScreen)} options={{ title: 'Registrar lugar' }} />
    <Stack.Screen name="EditPlace" component={themeAware(EditPlaceScreen)} options={{ title: 'Editar lugar' }} />
    <Stack.Screen name="PlaceDevice" component={themeAware(PlaceDeviceScreen)} options={{ title: 'Medidor' }} />
    <Stack.Screen name="LinkDevice" component={themeAware(LinkDeviceScreen)} options={{ title: 'Vincular medidor' }} />
    <Stack.Screen name="DeviceWifiSetup" component={themeAware(DeviceWifiSetupScreen)} options={{ title: 'WiFi del medidor' }} />
    <Stack.Screen name="PlaceDashboard" component={themeAware(PlaceDashboardScreen)} options={{ title: 'Panel' }} />
    <Stack.Screen name="ValveHistory" component={themeAware(ValveHistoryScreen)} options={{ title: 'Historial de la válvula' }} />
    <Stack.Screen name="PlaceTariff" component={themeAware(PlaceTariffScreen)} options={{ title: 'Tarifa del agua' }} />
    <Stack.Screen name="Tips" component={themeAware(TipsScreen)} options={{ title: 'Consejos de ahorro' }} />
    <Stack.Screen name="AdminTips" component={themeAware(AdminTipsScreen)} options={{ title: 'Recomendaciones' }} />
    <Stack.Screen name="AdminMetrics" component={themeAware(AdminMetricsScreen)} options={{ title: 'Resumen' }} />
    <Stack.Screen name="AdminUsers" component={themeAware(AdminUsersScreen)} options={{ title: 'Usuarios' }} />
    <Stack.Screen name="AdminDevices" component={themeAware(AdminDevicesScreen)} options={{ title: 'Medidores' }} />
    <Stack.Screen name="AdminDeviceDetail" component={themeAware(AdminDeviceDetailScreen)} options={({ route }) => ({ title: route.params.serialNumber ?? 'Medidor' })} />
    <Stack.Screen name="AdminDeviceCreate" component={themeAware(AdminDeviceCreateScreen)} options={{ title: 'Alta de fábrica' }} />
    <Stack.Screen name="Notifications" component={themeAware(NotificationsScreen)} options={{ title: 'Notificaciones' }} />
    <Stack.Screen
      name="NotificationPreferences"
      component={themeAware(NotificationPreferencesScreen)}
      options={{ title: 'Preferencias de notificaciones' }}
    />
    <Stack.Screen name="Profile" component={themeAware(ProfileScreen)} options={{ title: 'Mi perfil' }} />
    <Stack.Screen name="ChangePassword" component={themeAware(ChangePasswordScreen)} options={{ title: 'Cambiar contraseña' }} />
    <Stack.Screen name="DeleteAccount" component={themeAware(DeleteAccountScreen)} options={{ title: 'Eliminar cuenta' }} />
  </Stack.Navigator>
);
