import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Switch, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminTip, CATEGORY_LABELS, TIP_CATEGORIES, TipCategory, TipInput } from '../../../domain/tips/Tip';
import { RequireAdmin } from '../../components/admin/RequireAdmin';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { TipFormDialog } from '../../components/tips/TipFormDialog';
import { useAdminTips } from '../../hooks/useAdminTips';
import { MainStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<MainStackParamList, 'AdminTips'>;

type CategoryFilter = TipCategory | 'ALL';

const FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  ...TIP_CATEGORIES.map((value) => ({ value, label: CATEGORY_LABELS[value] })),
];

/** HU-063 + HU-064: the administrator publishes, edits and deactivates tips. A deactivated tip is hidden, never deleted. */
export const AdminTipsScreen: React.FC<Props> = () => (
  <RequireAdmin>
    <Tips />
  </RequireAdmin>
);

const Tips: React.FC = () => {
  const admin = useAdminTips();
  const [editing, setEditing] = useState<AdminTip | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (tip: AdminTip) => {
    setEditing(tip);
    setFormOpen(true);
  };

  const save = async (input: TipInput) => {
    setSaving(true);
    const ok = editing ? await admin.edit(editing.id, input) : await admin.create(input);
    setSaving(false);
    if (ok) setFormOpen(false);
  };

  return (
    <ScrollView style={screenStyle} contentContainerStyle={contentStyle}>
      <View style={headerRowStyle}>
        <View style={{ flex: 1, minWidth: 220 }}>
          <Text style={titleStyle}>Consejos de ahorro</Text>
          <Text style={mutedStyle}>Los que publiques los ven todos los usuarios, según el tipo de lugar.</Text>
        </View>
        <Button
          label="Nuevo consejo"
          size="medium"
          onPress={openNew}
          icon={<Ionicons name="add" size={20} color={theme.colors.textOnPrimary} />}
        />
      </View>

      <SegmentedControl
        options={FILTERS}
        value={admin.category ?? 'ALL'}
        onChange={(value) => admin.setCategory(value === 'ALL' ? null : value)}
      />
      <View style={switchRowStyle}>
        <Switch
          value={admin.includeInactive}
          onValueChange={admin.setIncludeInactive}
          trackColor={{ false: theme.colors.grayMedium, true: theme.colors.primary }}
          accessibilityLabel="Mostrar también los consejos desactivados"
        />
        <Text style={switchLabelStyle}>Mostrar también los desactivados</Text>
      </View>

      {!!admin.notice && <Banner tone="success" message={admin.notice} onClose={admin.dismissNotice} />}
      {!!admin.error && !formOpen && (
        <Banner tone="error" message={admin.error.message} action={{ label: 'Reintentar', onPress: () => void admin.reload() }} onClose={admin.dismissError} />
      )}

      {!admin.tips && admin.loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: theme.spacing.xxl }} />
      ) : (admin.tips ?? []).length === 0 ? (
        <View style={emptyStyle}>
          <Ionicons name="bulb-outline" size={44} color={theme.colors.textMuted} />
          <Text style={mutedStyle}>No hay consejos con ese filtro.</Text>
        </View>
      ) : (
        <View style={listStyle}>
          {(admin.tips ?? []).map((tip) => (
            <TipRow
              key={tip.id}
              tip={tip}
              busy={admin.busyId === tip.id}
              onEdit={() => openEdit(tip)}
              onToggle={() => void admin.setActive(tip, !tip.isActive)}
            />
          ))}
        </View>
      )}

      <TipFormDialog visible={formOpen} tip={editing} saving={saving} onSave={(input) => void save(input)} onCancel={() => setFormOpen(false)} />
      {formOpen && !!admin.error && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
          <Banner tone="error" message={admin.error.message} onClose={admin.dismissError} />
        </View>
      )}
    </ScrollView>
  );
};

const TipRow: React.FC<{ tip: AdminTip; busy: boolean; onEdit: () => void; onToggle: () => void }> = ({ tip, busy, onEdit, onToggle }) => (
  <Card variant="outlined" style={[rowStyle, !tip.isActive && inactiveRowStyle]}>
    <View style={{ flexGrow: 1, flexBasis: 240, gap: theme.spacing.xs }}>
      <View style={pillsStyle}>
        <View style={categoryPillStyle}>
          <Text style={pillTextStyle}>{CATEGORY_LABELS[tip.category]}</Text>
        </View>
        <View style={[statePillStyle, tip.isActive ? activePillStyle : inactivePillStyle]}>
          <Ionicons name={tip.isActive ? 'checkmark-circle-outline' : 'eye-off-outline'} size={14} color={theme.colors.textPrimary} />
          <Text style={pillTextStyle}>{tip.isActive ? 'Activo' : 'Desactivado'}</Text>
        </View>
      </View>
      <Text style={tipTitleStyle}>{tip.title}</Text>
      <Text style={tipBodyStyle} numberOfLines={3}>{tip.body}</Text>
    </View>
    <View style={actionsStyle}>
      <Button label="Editar" size="small" variant="secondary" onPress={onEdit} disabled={busy} />
      <Button
        label={tip.isActive ? 'Desactivar' : 'Activar'}
        size="small"
        variant={tip.isActive ? 'danger' : 'secondary'}
        onPress={onToggle}
        loading={busy}
      />
    </View>
  </Card>
);

const screenStyle: ViewStyle = themed(() => ({ flex: 1, backgroundColor: theme.colors.background }));
const contentStyle: ViewStyle = { padding: theme.spacing.lg, paddingBottom: theme.spacing.huge, gap: theme.spacing.md };
const headerRowStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: theme.spacing.md };
const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h2, color: theme.colors.textPrimary }));
const mutedStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));
const switchRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md };
const switchLabelStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary }));
const listStyle: ViewStyle = { gap: theme.spacing.md };
const rowStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: theme.spacing.md };
const inactiveRowStyle: ViewStyle = themed(() => ({ backgroundColor: theme.colors.surfaceAlt, borderStyle: 'dashed' }));
const pillsStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm };
const categoryPillStyle: ViewStyle = themed(() => ({
  paddingHorizontal: theme.spacing.md,
  paddingVertical: 4,
  borderRadius: theme.borderRadius.full,
  backgroundColor: theme.colors.infoBg,
  borderWidth: 1,
  borderColor: theme.colors.info,
}));
const statePillStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  paddingHorizontal: theme.spacing.md,
  paddingVertical: 4,
  borderRadius: theme.borderRadius.full,
  borderWidth: 1,
};
const activePillStyle: ViewStyle = themed(() => ({ backgroundColor: theme.colors.successBg, borderColor: theme.colors.success }));
const inactivePillStyle: ViewStyle = themed(() => ({ backgroundColor: theme.colors.warningBg, borderColor: theme.colors.warning }));
const pillTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.label, color: theme.colors.textPrimary }));
const tipTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, color: theme.colors.textPrimary }));
const tipBodyStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary }));
const actionsStyle: ViewStyle = { flexDirection: 'row', gap: theme.spacing.sm };
const emptyStyle: ViewStyle = { alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.huge };
