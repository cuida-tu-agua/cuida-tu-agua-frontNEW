import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import {
  AdminUser,
  SEARCH_MAX,
  STATUS_FILTERS,
  STATUS_LABELS,
  UserStatus,
  fullName,
  rangeLabel,
  userAction,
} from '../../../domain/admin/Admin';
import { RequireAdmin } from '../../components/admin/RequireAdmin';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Input } from '../../components/common/Input';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { useLayout } from '../../layout/breakpoints';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'AdminUsers'>;

const STATUS_TONES: Record<UserStatus, { fg: string; bg: string }> = themed(() => ({
  ACTIVE: { fg: theme.colors.success, bg: theme.colors.successBg },
  BLOCKED: { fg: theme.colors.error, bg: theme.colors.errorBg },
  UNVERIFIED: { fg: theme.colors.warning, bg: theme.colors.warningBg },
}));

/** HU-059 + HU-060: registered users with search, status filter and pages; an administrator can block and unblock. */
export const AdminUsersScreen: React.FC<Props> = () => (
  <RequireAdmin>
    <Users />
  </RequireAdmin>
);

const Users: React.FC = () => {
  const { user: me } = useAuth();
  const { isCompact } = useLayout();
  const users = useAdminUsers();

  const [blocking, setBlocking] = useState<AdminUser | null>(null);
  const [unblocking, setUnblocking] = useState<AdminUser | null>(null);
  const [reason, setReason] = useState('');

  const confirmBlock = async () => {
    if (!blocking) return;
    const target = blocking;
    setBlocking(null);
    await users.block(target, reason);
    setReason('');
  };

  const confirmUnblock = async () => {
    if (!unblocking) return;
    const target = unblocking;
    setUnblocking(null);
    await users.unblock(target);
  };

  const askAction = (user: AdminUser) => {
    const action = userAction(user, me?.id);
    if (action === 'block') {
      setReason('');
      setBlocking(user);
    } else if (action === 'unblock') {
      setUnblocking(user);
    }
  };

  const rows = users.data?.items ?? [];

  return (
    <ScrollView style={screenStyle} contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled">
      <Text style={titleStyle}>Usuarios</Text>

      <View style={filtersStyle}>
        <Input
          style={searchStyle}
          placeholder="Buscar por nombre o correo"
          value={users.search}
          onChangeText={users.setSearch}
          maxLength={SEARCH_MAX}
          autoCapitalize="none"
          leftIcon={<Ionicons name="search" size={18} color={theme.colors.textMuted} />}
        />
        {/* Four options do not fit on a phone: the strip scrolls sideways there instead of cutting the last one */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={statusFilterStyle} contentContainerStyle={{ minWidth: 400, flexGrow: 1 }}>
          <View style={{ flex: 1 }}>
            <SegmentedControl options={STATUS_FILTERS} value={users.status} onChange={users.setStatus} />
          </View>
        </ScrollView>
      </View>

      {!!users.notice && <Banner tone="success" message={users.notice} onClose={users.dismissNotice} />}
      {!!users.error && (
        <Banner
          tone="error"
          message={users.error.message}
          action={{ label: 'Reintentar', onPress: () => void users.reload() }}
          onClose={users.dismissError}
        />
      )}

      {!users.data && users.loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: theme.spacing.xxl }} />
      ) : rows.length === 0 ? (
        <View style={emptyStyle}>
          <Ionicons name="people-outline" size={44} color={theme.colors.textMuted} />
          <Text style={emptyTextStyle}>
            {users.search || users.status !== 'ALL' ? 'No hay usuarios con ese filtro.' : 'Todavía no hay usuarios registrados.'}
          </Text>
        </View>
      ) : (
        <View style={[listStyle, users.loading && { opacity: 0.6 }]}>
          {!isCompact && (
            <View style={[tableRowStyle, tableHeadStyle]}>
              <Text style={[headCellStyle, nameCol]}>Nombre</Text>
              <Text style={[headCellStyle, mailCol]}>Correo</Text>
              <Text style={[headCellStyle, statusCol]}>Estado</Text>
              <Text style={[headCellStyle, dateCol]}>Registro</Text>
              <View style={actionCol} />
            </View>
          )}
          {rows.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              compact={isCompact}
              action={userAction(user, me?.id)}
              busy={users.busyId === user.id}
              onAction={() => askAction(user)}
            />
          ))}
        </View>
      )}

      {users.data && users.data.totalItems > 0 && (
        <View style={pagerStyle}>
          <Text style={mutedStyle}>{rangeLabel(users.data)}</Text>
          <View style={pagerButtonsStyle}>
            <Button
              label="Anterior"
              size="small"
              variant="secondary"
              disabled={users.page <= 0 || users.loading}
              onPress={() => users.goTo(users.page - 1)}
            />
            <Text style={mutedStyle}>
              Página {users.data.page + 1} de {Math.max(users.data.totalPages, 1)}
            </Text>
            <Button
              label="Siguiente"
              size="small"
              variant="secondary"
              disabled={users.page + 1 >= users.data.totalPages || users.loading}
              onPress={() => users.goTo(users.page + 1)}
            />
          </View>
        </View>
      )}

      <ConfirmDialog
        visible={!!blocking}
        tone="danger"
        title={`¿Bloquear a ${blocking ? fullName(blocking) : ''}?`}
        message="Cerraremos todas sus sesiones al instante y no podrá volver a entrar hasta que lo desbloquees."
        confirmLabel="Bloquear"
        onConfirm={() => void confirmBlock()}
        onCancel={() => setBlocking(null)}
      >
        <Input
          label="Motivo (opcional)"
          placeholder="Ej.: uso indebido"
          value={reason}
          onChangeText={setReason}
          maxLength={200}
        />
      </ConfirmDialog>

      <ConfirmDialog
        visible={!!unblocking}
        title={`¿Desbloquear a ${unblocking ? fullName(unblocking) : ''}?`}
        message="Podrá iniciar sesión de nuevo."
        confirmLabel="Desbloquear"
        onConfirm={() => void confirmUnblock()}
        onCancel={() => setUnblocking(null)}
      />
    </ScrollView>
  );
};

const UserRow: React.FC<{
  user: AdminUser;
  compact: boolean;
  action: 'block' | 'unblock' | null;
  busy: boolean;
  onAction: () => void;
}> = ({ user, compact, action, busy, onAction }) => {
  const tone = STATUS_TONES[user.status];
  const date = new Date(user.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  const button = action && (
    <Button
      label={action === 'block' ? 'Bloquear' : 'Desbloquear'}
      size="small"
      variant={action === 'block' ? 'danger' : 'secondary'}
      loading={busy}
      onPress={onAction}
    />
  );
  const pill = (
    <View style={[pillStyle, { backgroundColor: tone.bg }]}>
      <Text style={[pillTextStyle, { color: tone.fg }]}>{STATUS_LABELS[user.status]}</Text>
    </View>
  );

  if (compact) {
    return (
      <View style={cardRowStyle}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={cellNameStyle} numberOfLines={1}>{fullName(user)}</Text>
          <Text style={cellStyle} numberOfLines={1}>{user.email}</Text>
          <View style={cardMetaStyle}>
            {pill}
            <Text style={mutedStyle}>{date}</Text>
          </View>
        </View>
        {button}
      </View>
    );
  }

  return (
    <View style={[tableRowStyle, tableBodyStyle]}>
      <Text style={[cellNameStyle, nameCol]} numberOfLines={1}>{fullName(user)}</Text>
      <Text style={[cellStyle, mailCol]} numberOfLines={1}>{user.email}</Text>
      <View style={statusCol}>{pill}</View>
      <Text style={[cellStyle, dateCol]}>{date}</Text>
      <View style={actionCol}>{button}</View>
    </View>
  );
};

const screenStyle: ViewStyle = themed(() => ({ flex: 1, backgroundColor: theme.colors.background }));
const contentStyle: ViewStyle = { padding: theme.spacing.lg, paddingBottom: theme.spacing.huge, gap: theme.spacing.md };
const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h2, color: theme.colors.textPrimary }));
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
const filtersStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, alignItems: 'flex-start' };
const searchStyle: ViewStyle = { flexGrow: 1, flexBasis: 280, marginBottom: 0 };
const statusFilterStyle: ViewStyle = { flexGrow: 2, flexBasis: 360 };
const listStyle: ViewStyle = themed(() => ({
  backgroundColor: theme.colors.surface,
  borderRadius: theme.borderRadius.medium,
  borderWidth: 1,
  borderColor: theme.colors.border,
  overflow: 'hidden',
}));
const tableRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg };
const tableHeadStyle: ViewStyle = themed(() => ({ height: 40, backgroundColor: theme.colors.surfaceAlt }));
const tableBodyStyle: ViewStyle = themed(() => ({ minHeight: 60, borderTopWidth: 1, borderTopColor: theme.colors.border }));
const headCellStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, color: theme.colors.textMuted, textTransform: 'uppercase' }));
const nameCol: TextStyle & ViewStyle = { flex: 2.2 };
const mailCol: TextStyle & ViewStyle = { flex: 3 };
const statusCol: ViewStyle = { flex: 1.5, alignItems: 'flex-start' };
const dateCol: TextStyle & ViewStyle = { flex: 1.5 };
const actionCol: ViewStyle = { flex: 1.5, alignItems: 'flex-end' };
const cellStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary }));
const cellNameStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontWeight: '800', color: theme.colors.textPrimary }));
const pillStyle: ViewStyle = { paddingHorizontal: theme.spacing.md, paddingVertical: 4, borderRadius: theme.borderRadius.full };
const pillTextStyle: TextStyle = { ...theme.textStyles.label, fontWeight: '800' };
const cardRowStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.md,
  padding: theme.spacing.lg,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
}));
const cardMetaStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.xs };
const emptyStyle: ViewStyle = { alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.huge };
const emptyTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary, textAlign: 'center' }));
const pagerStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md };
const pagerButtonsStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md };
