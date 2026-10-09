import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import { MainStackParamList } from './types';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type NavSection = 'places' | 'notifications' | 'profile';

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

/** What the side menu shows for a user. Later steps add the inbox and the administration to this list. */
export const navItemsFor = (_roles: readonly string[] = []): NavItem[] => [...BASE_ITEMS];

const SECTION_OF_ROUTE: Partial<Record<keyof MainStackParamList, NavSection>> = {
  Places: 'places',
  CreatePlace: 'places',
  EditPlace: 'places',
  PlaceDevice: 'places',
  LinkDevice: 'places',
  DeviceWifiSetup: 'places',
  PlaceDashboard: 'places',
  ValveHistory: 'places',
  Notifications: 'notifications',
  NotificationPreferences: 'notifications',
  Profile: 'profile',
  ChangePassword: 'profile',
  DeleteAccount: 'profile',
};

/** Which menu item is lit for the screen that is open (sub-screens light their parent). */
export const sectionOf = (routeName: string | undefined): NavSection | null =>
  (routeName && SECTION_OF_ROUTE[routeName as keyof MainStackParamList]) || null;
