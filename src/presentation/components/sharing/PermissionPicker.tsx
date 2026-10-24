import React from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { ALWAYS_GRANTED, Permission, PERMISSIONS } from '../../../domain/sharing/Sharing';
import { togglePermission } from '../../../domain/sharing/sharingRules';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';
import { Checkbox } from '../common/Checkbox';
import { permissionHint, permissionLabel } from './sharingLabels';

interface PermissionPickerProps {
  value: readonly Permission[];
  onChange: (permissions: Permission[]) => void;
}

/** HU-042/046: what a collaborator may do. Seeing the consumption is always on; the others are the owner's choice. */
export const PermissionPicker: React.FC<PermissionPickerProps> = ({ value, onChange }) => (
  <View style={listStyle}>
    {PERMISSIONS.map((permission) => (
      <View key={permission} style={rowStyle}>
        <Checkbox checked={permission === ALWAYS_GRANTED || value.includes(permission)} onChange={() => onChange(togglePermission(value, permission))}>
          <Text style={labelStyle}>{permissionLabel(permission)}</Text>
        </Checkbox>
        <Text style={hintStyle}>{permissionHint(permission)}</Text>
      </View>
    ))}
  </View>
);

const listStyle: ViewStyle = { gap: theme.spacing.sm };
const rowStyle: ViewStyle = { gap: 2 };
const labelStyle: TextStyle = themed(() => ({ ...theme.textStyles.body, color: theme.colors.textPrimary, fontWeight: '700' }));
const hintStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted, marginLeft: 34 }));
