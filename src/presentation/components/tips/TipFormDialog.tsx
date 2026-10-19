import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, Text, TextStyle, View, ViewStyle } from 'react-native';
import { AdminTip, BODY_MAX, CATEGORY_LABELS, TIP_CATEGORIES, TITLE_MAX, TipForm, TipInput, validateTip } from '../../../domain/tips/Tip';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { SegmentedControl } from '../common/SegmentedControl';

interface TipFormDialogProps {
  visible: boolean;
  /** The tip being edited; null = a new one. */
  tip: AdminTip | null;
  saving: boolean;
  onSave: (input: TipInput) => void;
  onCancel: () => void;
}

/** HU-063: the form of the administrator asks for title, body and category (residential / commercial). */
export const TipFormDialog: React.FC<TipFormDialogProps> = ({ visible, tip, saving, onSave, onCancel }) => {
  const [form, setForm] = useState<TipForm>({ title: '', body: '', category: null });
  const [errors, setErrors] = useState<Partial<Record<keyof TipForm, string>>>({});

  // Every time it opens it starts from the tip being edited, or empty
  useEffect(() => {
    if (!visible) return;
    setForm(tip ? { title: tip.title, body: tip.body, category: tip.category } : { title: '', body: '', category: null });
    setErrors({});
  }, [visible, tip]);

  const submit = () => {
    const { errors: found, value } = validateTip(form);
    setErrors(found);
    if (value) onSave(value);
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={saving ? undefined : onCancel}>
      <View style={backdropStyle}>
        <View style={cardStyle} accessibilityViewIsModal>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={titleStyle} accessibilityRole="header">
              {tip ? 'Editar consejo' : 'Nuevo consejo'}
            </Text>

            <Input
              label="Título"
              value={form.title}
              onChangeText={(title) => setForm((f) => ({ ...f, title }))}
              error={errors.title}
              maxLength={TITLE_MAX}
              placeholder="Ej.: Cierra la llave mientras te cepillas"
            />
            <Input
              label="Consejo"
              value={form.body}
              onChangeText={(body) => setForm((f) => ({ ...f, body }))}
              error={errors.body}
              maxLength={BODY_MAX}
              multiline
              placeholder="Explica la buena práctica y cuánta agua ahorra"
              hint={`${form.body.length} de ${BODY_MAX} caracteres`}
            />
            <SegmentedControl
              label="¿Para qué tipo de lugar?"
              options={TIP_CATEGORIES.map((value) => ({ value, label: CATEGORY_LABELS[value] }))}
              value={form.category}
              onChange={(category) => setForm((f) => ({ ...f, category }))}
              error={errors.category}
            />
            {!tip && <Text style={hintStyle}>Al publicarlo lo verán todos los usuarios de ese tipo de lugar.</Text>}

            <View style={buttonsStyle}>
              <Button label={tip ? 'Guardar cambios' : 'Publicar consejo'} onPress={submit} loading={saving} size="medium" />
              <Button label="Cancelar" onPress={onCancel} variant="ghost" size="medium" disabled={saving} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const backdropStyle: ViewStyle = themed(() => ({
  flex: 1,
  backgroundColor: theme.colors.overlay,
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing.lg,
}));
const cardStyle: ViewStyle = themed(() => ({
  width: '100%',
  maxWidth: 560,
  maxHeight: '92%',
  backgroundColor: theme.colors.surface,
  borderRadius: theme.borderRadius.large,
  padding: theme.spacing.xl,
}));
const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h2, color: theme.colors.textPrimary, marginBottom: theme.spacing.lg }));
const hintStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted, marginBottom: theme.spacing.md }));
const buttonsStyle: ViewStyle = { gap: theme.spacing.sm, marginTop: theme.spacing.sm };
