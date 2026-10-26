import { Platform } from 'react-native';
import { isAdmin } from '../../domain/admin/Admin';

/**
 * The administration (E14) is a web panel: on the phone apps an administrator uses the app like any other person, so
 * its menus and screens are hidden there. The servers still check the ADMIN role on every call.
 */
export const canUseAdmin = (roles: readonly string[] | undefined | null, os: string = Platform.OS): boolean =>
  isAdmin(roles) && os === 'web';
