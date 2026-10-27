import React, { useState } from 'react';
import { Modal, Platform, ScrollView, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LegalDocumentId } from '../../../domain/legal/LegalDocument';
import { legalDocument } from '../../../i18n/legal';
import { useLayout } from '../../layout/breakpoints';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';
import { Button } from '../common/Button';
import { LegalDocumentView } from './LegalDocumentView';

interface LegalDocumentModalProps {
  /** The document to show; null = closed. */
  documentId: LegalDocumentId | null;
  onClose: () => void;
}

/**
 * The terms, the data policy and the other legal texts in a window over the screen, as apps usually do: the person reads
 * them without leaving the form they were filling in. A dialog on a wide screen, the whole screen on a phone.
 */
export const LegalDocumentModal: React.FC<LegalDocumentModalProps> = ({ documentId, onClose }) => {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isCompact } = useLayout();
  // Keep the last document while the window fades out, so it does not go blank before closing
  const [shown, setShown] = useState<LegalDocumentId | null>(documentId);
  if (documentId && documentId !== shown) setShown(documentId);

  const document = shown ? legalDocument(shown, i18n.language) : null;
  const full = isCompact && Platform.OS !== 'web';

  return (
    <Modal
      transparent
      visible={documentId !== null}
      animationType={full ? 'slide' : 'fade'}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[backdropStyle, full && { padding: 0 }]}>
        <View
          style={[cardStyle, full ? [fullStyle, { paddingTop: insets.top, paddingBottom: insets.bottom }] : dialogStyle]}
          accessibilityViewIsModal
        >
          <View style={headerStyle}>
            <Text style={titleStyle} accessibilityRole="header" numberOfLines={2}>
              {document?.title}
            </Text>
            <TouchableOpacity onPress={onClose} style={closeStyle} accessibilityRole="button" accessibilityLabel={t('legal.close')} hitSlop={12}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={bodyStyle} contentContainerStyle={bodyContentStyle}>
            {document && <LegalDocumentView document={document} />}
          </ScrollView>
          <View style={footerStyle}>
            <Button label={t('legal.understood')} size="medium" onPress={onClose} />
          </View>
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

const cardStyle: ViewStyle = themed(() => ({ backgroundColor: theme.colors.surface, overflow: 'hidden', ...theme.shadows.prominent }));

const dialogStyle: ViewStyle = { width: '100%', maxWidth: 760, height: '88%', borderRadius: theme.borderRadius.large };

const fullStyle: ViewStyle = { width: '100%', height: '100%' };

const headerStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.md,
  paddingHorizontal: theme.spacing.xl,
  paddingVertical: theme.spacing.lg,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
}));

const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, color: theme.colors.textPrimary, flex: 1 }));

const closeStyle: ViewStyle = { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' };

const bodyStyle: ViewStyle = { flex: 1 };

const bodyContentStyle: ViewStyle = { padding: theme.spacing.xl };

const footerStyle: ViewStyle = themed(() => ({
  paddingHorizontal: theme.spacing.xl,
  paddingVertical: theme.spacing.lg,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
}));
