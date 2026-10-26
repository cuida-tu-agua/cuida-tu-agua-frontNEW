import React, { useState } from 'react';
import { Platform, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { LEGAL_CONTACT } from '../../../config/legal';
import { useAuth } from '../../../core/auth/AuthContext';
import { LEGAL_DOCUMENT_IDS, LegalDocumentId, legalDocumentFromSlug } from '../../../domain/legal/LegalDocument';
import { legalDocument } from '../../../i18n/legal';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { LegalDocumentModal, LegalDocumentView } from '../../components/legal';
import { LegalParams } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

type Props = NativeStackScreenProps<{ Legal: LegalParams }, 'Legal'>;

const ICONS: Record<LegalDocumentId, keyof typeof Ionicons.glyphMap> = {
  terms: 'document-text-outline',
  privacy: 'shield-checkmark-outline',
  notice: 'information-circle-outline',
  deletion: 'trash-outline',
  device: 'hardware-chip-outline',
};

/**
 * "Privacidad y legal": every legal document of the app. With a document in the address ({app}/legal/privacidad) it is
 * the public page of that document, the one given to Google Play and the App Store; it opens with or without a session,
 * so it is in both navigators. Without one it is the list, and each document opens in the modal.
 */
export const LegalScreen: React.FC<Props> = ({ route }) => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { status } = useAuth();
  const signedIn = status === 'signedIn';
  const [open, setOpen] = useState<LegalDocumentId | null>(null);
  const selected = legalDocumentFromSlug(route.params?.doc);

  if (selected) {
    const document = legalDocument(selected, i18n.language);
    return (
      <PageContainer narrow>
        <PageHeader
          title={document.title}
          caption={t('legal.title')}
          back={{ label: t('legal.allDocuments'), onPress: () => navigation.navigate('Legal', { doc: undefined }) }}
        />
        <Card variant="outlined" style={documentCardStyle}>
          <LegalDocumentView document={document} />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer narrow gap={theme.spacing.sm}>
      <PageHeader
        title={t('legal.title')}
        subtitle={t('legal.subtitle')}
        back={!signedIn ? { label: t('auth.register.signIn'), onPress: () => navigation.navigate('Login') } : undefined}
      />
      {Platform.OS !== 'web' && <Text style={introStyle}>{t('legal.subtitle')}</Text>}

      {LEGAL_DOCUMENT_IDS.map((id) => {
        const document = legalDocument(id, i18n.language);
        return (
          <TouchableOpacity key={id} style={rowStyle} onPress={() => setOpen(id)} accessibilityRole="button" accessibilityLabel={document.title}>
            <Ionicons name={ICONS[id]} size={24} color={theme.colors.primary} />
            <View style={rowTextBlockStyle}>
              <Text style={rowTitleStyle}>{document.title}</Text>
              <Text style={rowSummaryStyle}>{document.summary}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        );
      })}

      <Card variant="outlined" style={contactCardStyle}>
        <Text style={contactTitleStyle}>{t('legal.contactTitle')}</Text>
        <Text style={rowSummaryStyle}>{t('legal.contactText', { email: LEGAL_CONTACT.email })}</Text>
        {signedIn && (
          <Button label={t('legal.deleteAccount')} variant="ghost" size="small" onPress={() => navigation.navigate('DeleteAccount')} style={deleteStyle} />
        )}
      </Card>

      <LegalDocumentModal documentId={open} onClose={() => setOpen(null)} />
    </PageContainer>
  );
};

const documentCardStyle: ViewStyle = { padding: theme.spacing.xl };

const introStyle: TextStyle = themed(() => ({ ...theme.textStyles.body, color: theme.colors.textSecondary, marginBottom: theme.spacing.md }));

const rowStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.md,
  padding: theme.spacing.lg,
  borderRadius: theme.borderRadius.medium,
  backgroundColor: theme.colors.surface,
  borderWidth: 1,
  borderColor: theme.colors.border,
}));

const rowTextBlockStyle: ViewStyle = { flex: 1, gap: 2 };

const rowTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.button, letterSpacing: 0, color: theme.colors.textPrimary }));

const rowSummaryStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textSecondary }));

const contactCardStyle: ViewStyle = { marginTop: theme.spacing.lg, padding: theme.spacing.lg, gap: theme.spacing.xs };

const contactTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, color: theme.colors.textPrimary }));

const deleteStyle: ViewStyle = { alignSelf: 'flex-start', marginTop: theme.spacing.sm };
