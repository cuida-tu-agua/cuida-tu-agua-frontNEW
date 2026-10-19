import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import i18n from '../../i18n';
import { isAdmin } from '../../domain/admin/Admin';
import { MainStackParamList } from './types';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type NavSection = 'places' | 'tips' | 'notifications' | 'adminMetrics' | 'adminUsers' | 'adminDevices' | 'adminTips' | 'profile';

export interface NavItem {
  section: NavSection;
  label: string;
  icon: IconName;
  /** Screen the item opens. */
  route: keyof MainStackParamList;
}

const BASE_ITEMS: NavItem[] = [
  { section: 'places', get label() { return i18n.t('nav.places'); }, icon: 'home-outline', route: 'Places' },
  { section: 'notifications', get label() { return i18n.t('nav.notifications'); }, icon: 'notifications-outline', route: 'Notifications' },
  { section: 'tips', get label() { return i18n.t('nav.tips'); }, icon: 'heart-outline', route: 'Tips' },
  { section: 'profile', get label() { return i18n.t('nav.profile'); }, icon: 'person-circle-outline', route: 'Profile' },
];

/** Administration (E14): only the ADMIN role sees it. The servers refuse these calls to anybody else anyway. */
const ADMIN_ITEMS: NavItem[] = [
  { section: 'adminMetrics', get label() { return i18n.t('nav.adminSummary'); }, icon: 'stats-chart-outline', route: 'AdminMetrics' },
  { section: 'adminUsers', get label() { return i18n.t('nav.adminUsers'); }, icon: 'people-outline', route: 'AdminUsers' },
  { section: 'adminDevices', get label() { return i18n.t('nav.adminDevices'); }, icon: 'hardware-chip-outline', route: 'AdminDevices' },
  { section: 'adminTips', get label() { return i18n.t('nav.adminTips'); }, icon: 'bulb-outline', route: 'AdminTips' },
];

/** `label` is a getter on every item, so the text follows the language active when it is read. */
/** The menu of a person using their places: places, inbox, favorite tips, profile. */
export const userNavItems = (): NavItem[] => [...BASE_ITEMS];

/** The menu of the administration area (its own menu, like the Figma boards). */
export const adminNavItems = (): NavItem[] => [...ADMIN_ITEMS];

/** Door between the two areas: an administrator sees it in the user menu, and the admin menu has the way back. */
export const ADMIN_DOOR: NavItem = { section: 'adminMetrics', get label() { return i18n.t('nav.adminDoor'); }, icon: 'shield-checkmark-outline', route: 'AdminMetrics' };
export const USER_DOOR: NavItem = { section: 'places', get label() { return i18n.t('nav.userDoor'); }, icon: 'home-outline', route: 'Places' };

export const isAdminSection = (section: NavSection | null): boolean => !!section && section.startsWith('admin');

/** What the side menu shows: the admin area has its own menu, everybody else the user menu (+ the door for admins). */
export const navItemsFor = (roles: readonly string[] = [], section: NavSection | null = null): NavItem[] => {
  if (isAdmin(roles) && isAdminSection(section)) return [...ADMIN_ITEMS];
  return isAdmin(roles) ? [...BASE_ITEMS, ADMIN_DOOR] : [...BASE_ITEMS];
};

const SECTION_OF_ROUTE: Partial<Record<keyof MainStackParamList, NavSection>> = {
  Places: 'places',
  CreatePlace: 'places',
  EditPlace: 'places',
  PlaceDevice: 'places',
  LinkDevice: 'places',
  DeviceWifiSetup: 'places',
  PlaceDashboard: 'places',
  PlaceTariff: 'places',
  Tips: 'tips',
  AdminTips: 'adminTips',
  ValveHistory: 'places',
  AdminMetrics: 'adminMetrics',
  AdminUsers: 'adminUsers',
  AdminDevices: 'adminDevices',
  AdminDeviceDetail: 'adminDevices',
  AdminDeviceCreate: 'adminDevices',
  Notifications: 'notifications',
  NotificationPreferences: 'notifications',
  Profile: 'profile',
  ChangePassword: 'profile',
  DeleteAccount: 'profile',
};

/** Which menu item is lit for the screen that is open (sub-screens light their parent). */
export const sectionOf = (routeName: string | undefined): NavSection | null =>
  (routeName && SECTION_OF_ROUTE[routeName as keyof MainStackParamList]) || null;
