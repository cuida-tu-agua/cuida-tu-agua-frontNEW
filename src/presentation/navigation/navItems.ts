import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import { isAdmin } from '../../domain/admin/Admin';
import { MainStackParamList } from './types';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type NavSection = 'places' | 'notifications' | 'adminMetrics' | 'adminUsers' | 'profile';

export interface NavItem {
  section: NavSection;
  label: string;
  icon: IconName;
  /** Screen the item opens. */
  route: keyof MainStackParamList;
}

const BASE_ITEMS: NavItem[] = [
  { section: 'places', label: 'Mis lugares', icon: 'water-outline', route: 'Places' },
  { section: 'notifications', label: 'Notificaciones', icon: 'notifications-outline', route: 'Notifications' },
  { section: 'profile', label: 'Mi perfil', icon: 'person-circle-outline', route: 'Profile' },
];

/** Administration (E14): only the ADMIN role sees it. The servers refuse these calls to anybody else anyway. */
const ADMIN_ITEMS: NavItem[] = [
  { section: 'adminMetrics', label: 'Métricas', icon: 'stats-chart-outline', route: 'AdminMetrics' },
  { section: 'adminUsers', label: 'Usuarios', icon: 'people-outline', route: 'AdminUsers' },
];

/** What the side menu shows for a user: places, inbox and, for administrators, the administration, then the profile. */
export const navItemsFor = (roles: readonly string[] = []): NavItem[] => {
  const [places, notifications, profile] = BASE_ITEMS;
  return isAdmin(roles) ? [places, notifications, ...ADMIN_ITEMS, profile] : [...BASE_ITEMS];
};

const SECTION_OF_ROUTE: Partial<Record<keyof MainStackParamList, NavSection>> = {
  Places: 'places',
  CreatePlace: 'places',
  EditPlace: 'places',
  PlaceDevice: 'places',
  LinkDevice: 'places',
  DeviceWifiSetup: 'places',
  PlaceDashboard: 'places',
  ValveHistory: 'places',
  AdminMetrics: 'adminMetrics',
  AdminUsers: 'adminUsers',
  Notifications: 'notifications',
  NotificationPreferences: 'notifications',
  Profile: 'profile',
  ChangePassword: 'profile',
  DeleteAccount: 'profile',
};

/** Which menu item is lit for the screen that is open (sub-screens light their parent). */
export const sectionOf = (routeName: string | undefined): NavSection | null =>
  (routeName && SECTION_OF_ROUTE[routeName as keyof MainStackParamList]) || null;
