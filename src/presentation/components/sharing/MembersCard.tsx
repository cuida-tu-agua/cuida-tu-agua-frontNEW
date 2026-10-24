import React, { useState } from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppError } from '../../../domain/common/AppError';
import { Member, Permission } from '../../../domain/sharing/Sharing';
import { samePermissions, withRequired } from '../../../domain/sharing/sharingRules';
import { toAppError } from '../../../infrastructure/http/httpError';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';
import { Banner } from '../common/Banner';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { PermissionPicker } from './PermissionPicker';
import { permissionSummary } from './sharingLabels';

interface MembersCardProps {
  members: Member[];
  changePermissions: (memberId: string, permissions: Permission[]) => Promise<void>;
  revoke: (memberId: string) => Promise<void>;
}

/** HU-043 / HU-046: who collaborates, what they may do, and the owner's two actions: change permissions, take the access away. */
export const MembersCard: React.FC<MembersCardProps> = ({ members, changePermissions, revoke }) => {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Permission[]>([]);
  const [revoking, setRevoking] = useState<Member | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<AppError | null>(null);

  const startEdit = (member: Member) => {
    setEditingId(member.id);
    setDraft(withRequired(member.permissions));
    setNotice(null);
    setError(null);
  };

  const run = async (action: () => Promise<void>, done: string) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
      setNotice(done);
      return true;
    } catch (e) {
      setError(toAppError(e));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const save = async (member: Member) => {
    if (await run(() => changePermissions(member.id, withRequired(draft)), t('sharing.members.saved'))) setEditingId(null);
  };

  const confirmRevoke = async () => {
    if (!revoking) return;
    const member = revoking;
    await run(() => revoke(member.id), t('sharing.members.revoked'));
    setRevoking(null);
    if (editingId === member.id) setEditingId(null);
  };

  return (
    <Card variant="outlined" style={cardStyle}>
      <Text style={titleStyle}>{t('sharing.members.title')}</Text>
      {!!error && <Banner tone="error" message={error.message} onClose={() => setError(null)} />}
      {!!notice && <Banner tone="success" message={notice} onClose={() => setNotice(null)} />}

      {members.length === 0 ? (
        <Text style={mutedStyle}>{t('sharing.members.empty')}</Text>
      ) : (
        members.map((member) => {
          const editing = editingId === member.id;
          return (
            <View key={member.id} style={memberStyle}>
              <View style={{ gap: 2 }}>
                <Text style={nameStyle}>{member.name ?? t('sharing.members.unnamed')}</Text>
                {!!member.email && <Text style={mutedStyle}>{member.email}</Text>}
                {!editing && <Text style={mutedStyle}>{permissionSummary(member.permissions)}</Text>}
              </View>

              {editing ? (
                <>
                  <PermissionPicker value={draft} onChange={setDraft} />
                  <View style={buttonsStyle}>
                    <Button
                      label={t('sharing.members.save')}
                      size="small"
                      loading={busy}
                      disabled={samePermissions(draft, member.permissions)}
                      onPress={() => save(member)}
                    />
                    <Button label={t('common.cancel')} size="small" variant="secondary" disabled={busy} onPress={() => setEditingId(null)} />
                  </View>
                </>
              ) : (
                <View style={buttonsStyle}>
                  <Button label={t('sharing.members.edit')} size="small" variant="secondary" disabled={busy} onPress={() => startEdit(member)} />
                  <Button label={t('sharing.members.revoke')} size="small" variant="danger" disabled={busy} onPress={() => setRevoking(member)} />
                </View>
              )}
            </View>
          );
        })
      )}

      <ConfirmDialog
        visible={!!revoking}
        title={t('sharing.members.revokeTitle', { name: revoking?.name ?? revoking?.email ?? t('sharing.members.unnamed') })}
        message={t('sharing.members.revokeText')}
        confirmLabel={t('sharing.members.revokeConfirm')}
        tone="danger"
        loading={busy}
        onConfirm={confirmRevoke}
        onCancel={() => setRevoking(null)}
      />
    </Card>
  );
};

const cardStyle: ViewStyle = { gap: theme.spacing.md };
const memberStyle: ViewStyle = themed(() => ({
  gap: theme.spacing.sm,
  paddingTop: theme.spacing.md,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
}));
const buttonsStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm };
const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, color: theme.colors.textPrimary }));
const nameStyle: TextStyle = themed(() => ({ ...theme.textStyles.body, color: theme.colors.textPrimary, fontWeight: '700' }));
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
