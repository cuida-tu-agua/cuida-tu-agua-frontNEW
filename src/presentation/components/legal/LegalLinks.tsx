import React, { useState } from 'react';
import { GestureResponderEvent, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LegalDocumentId } from '../../../domain/legal/LegalDocument';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';
import { LegalDocumentModal } from './LegalDocumentModal';

/**
 * A link inside a text that opens a legal document. It stops the press there: inside the box of the terms (a Pressable)
 * the web would otherwise also tick or untick the box.
 */
export const LegalLink: React.FC<{ label: string; onOpen: () => void; style?: TextStyle }> = ({ label, onOpen, style }) => (
  <Text
    style={[linkStyle, style]}
    onPress={(event: GestureResponderEvent) => {
      event?.stopPropagation?.();
      onOpen();
    }}
    accessibilityRole="link"
    suppressHighlighting
  >
    {label}
  </Text>
);

/** "Términos · Privacidad · Eliminar cuenta" under the sign-in and sign-up forms. */
export const LegalLinks: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState<LegalDocumentId | null>(null);
  const links: [LegalDocumentId, string][] = [
    ['terms', t('legal.linkTerms')],
    ['privacy', t('legal.linkPrivacy')],
    ['deletion', t('legal.linkDeletion')],
  ];
  return (
    <View style={rowStyle}>
      {links.map(([id, label], index) => (
        <Text key={id} style={smallStyle}>
          {index > 0 && <Text style={dotStyle}>{'  ·  '}</Text>}
          <LegalLink label={label} onOpen={() => setOpen(id)} style={smallLinkStyle} />
        </Text>
      ))}
      <LegalDocumentModal documentId={open} onClose={() => setOpen(null)} />
    </View>
  );
};

/** "Al continuar con Google aceptas los Términos… y la Política…", under the Google button. */
export const GoogleConsentNote: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState<LegalDocumentId | null>(null);
  return (
    <>
      <Text style={noteStyle}>
        {t('legal.googlePrefix')}
        <LegalLink label={t('legal.termsName')} onOpen={() => setOpen('terms')} />
        {t('legal.googleMiddle')}
        <LegalLink label={t('legal.privacyName')} onOpen={() => setOpen('privacy')} />
        {t('legal.googleSuffix')}
      </Text>
      <LegalDocumentModal documentId={open} onClose={() => setOpen(null)} />
    </>
  );
};

const linkStyle: TextStyle = themed(() => ({ color: theme.colors.primary, textDecorationLine: 'underline' }));

const rowStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: theme.spacing.lg };

const smallStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));

const smallLinkStyle: TextStyle = themed(() => ({ color: theme.colors.textSecondary }));

const dotStyle: TextStyle = themed(() => ({ color: theme.colors.textMuted, textDecorationLine: 'none' }));

const noteStyle: TextStyle = themed(() => ({
  ...theme.textStyles.caption,
  color: theme.colors.textSecondary,
  textAlign: 'center',
  marginTop: theme.spacing.md,
}));
