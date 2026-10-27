import React from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LEGAL_VERSION, LegalBlock, LegalDocument, boldPieces } from '../../../domain/legal/LegalDocument';
import { legalEffectiveDate } from '../../../i18n/legal';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

/** The body of a legal document (version, summary and sections). The modal and the web page draw it the same way. */
export const LegalDocumentView: React.FC<{ document: LegalDocument }> = ({ document }) => {
  const { t, i18n } = useTranslation();
  return (
    <View style={wrapStyle}>
      <Text style={versionStyle}>{t('legal.version', { version: LEGAL_VERSION, date: legalEffectiveDate(i18n.language) })}</Text>
      <Text style={summaryStyle}>{document.summary}</Text>
      {document.sections.map((section) => (
        <View key={section.title} style={sectionStyle}>
          <Text style={sectionTitleStyle} accessibilityRole="header">
            {section.title}
          </Text>
          {section.blocks.map((block, index) => (
            <Block key={index} block={block} />
          ))}
        </View>
      ))}
    </View>
  );
};

const Block: React.FC<{ block: LegalBlock }> = ({ block }) => {
  if (typeof block === 'string') return <RichText style={paragraphStyle} text={block} />;
  return (
    <View style={listStyle}>
      {block.items.map((item, index) => (
        <View key={index} style={itemStyle}>
          <Text style={markerStyle}>{'•'}</Text>
          <RichText style={itemTextStyle} text={item} />
        </View>
      ))}
    </View>
  );
};

/** A text where **these words** are bold. */
const RichText: React.FC<{ text: string; style: TextStyle }> = ({ text, style }) => (
  <Text style={style}>
    {boldPieces(text).map((piece, index) =>
      piece.bold ? (
        <Text key={index} style={boldStyle}>
          {piece.text}
        </Text>
      ) : (
        piece.text
      ),
    )}
  </Text>
);

const wrapStyle: ViewStyle = { gap: theme.spacing.lg };

const versionStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, color: theme.colors.textMuted }));

const summaryStyle: TextStyle = themed(() => ({ ...theme.textStyles.bodyLong, color: theme.colors.textSecondary }));

const sectionStyle: ViewStyle = { gap: theme.spacing.sm };

const sectionTitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h3, color: theme.colors.textPrimary }));

const paragraphStyle: TextStyle = themed(() => ({ ...theme.textStyles.bodyLong, color: theme.colors.textPrimary }));

const listStyle: ViewStyle = { gap: theme.spacing.xs };

const itemStyle: ViewStyle = { flexDirection: 'row', gap: theme.spacing.sm, paddingLeft: theme.spacing.xs };

const markerStyle: TextStyle = themed(() => ({ ...theme.textStyles.bodyLong, color: theme.colors.primary, minWidth: 16 }));

const itemTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.bodyLong, color: theme.colors.textPrimary, flex: 1 }));

const boldStyle: TextStyle = themed(() => ({ fontFamily: theme.textStyles.h3.fontFamily, fontWeight: '600' }));
