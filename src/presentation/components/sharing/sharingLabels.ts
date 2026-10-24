import i18n from '../../../i18n';
import { Permission } from '../../../domain/sharing/Sharing';

export const permissionLabel = (permission: Permission): string => i18n.t(`sharing.permissions.${permission}.label`);
export const permissionHint = (permission: Permission): string => i18n.t(`sharing.permissions.${permission}.hint`);

/** "Ver el consumo, Abrir y cerrar la válvula" — the permissions of one person on one line. */
export const permissionSummary = (permissions: readonly Permission[]): string =>
  permissions.map(permissionLabel).join(' · ');
