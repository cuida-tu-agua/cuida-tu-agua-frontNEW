import React from 'react';
import { Platform, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

interface PageHeaderProps {
  title: string;
  /** Small line above the title ("Hola, Laura", "Panel del lugar"). */
  caption?: string;
  subtitle?: string;
  /** "← Mis lugares": the way back at the top of a detail page. */
  back?: { label: string; onPress: () => void };
  /** Buttons / chips on the right of the title (they wrap under it on a narrow screen). */
  right?: React.ReactNode;
  /**
   * The Figma boards put this header in the web page. On a phone app the native navigation bar already shows the
   * title, so by default nothing is drawn there; pass false when the phone design also has the big title (then only
   * the title and the actions show: the back arrow and the caption belong to the native bar).
   */
  webOnly?: boolean;
}

/** Title block of a page, same on every screen: back link, caption, big title, subtitle and the actions on the right. */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, caption, subtitle, back, right, webOnly = true }) => {
  const web = Platform.OS === 'web';
  if (webOnly && !web) return null;

  return (
    <View style={wrapStyle}>
      {web && !!back && (
        <TouchableOpacity onPress={back.onPress} style={backStyle} accessibilityRole="link" accessibilityLabel={`Volver a ${back.label}`} hitSlop={8}>
          <Ionicons name="arrow-back" size={16} color={theme.colors.primary} />
          <Text style={backTextStyle}>{back.label}</Text>
        </TouchableOpacity>
      )}
      <View style={rowStyle}>
        <View style={textBlockStyle}>
          {web && !!caption && <Text style={captionStyle}>{caption}</Text>}
          <Text style={titleStyle} accessibilityRole="header">
            {title}
          </Text>
          {!!subtitle && <Text style={subtitleStyle}>{subtitle}</Text>}
        </View>
        {!!right && <View style={rightStyle}>{right}</View>}
      </View>
    </View>
  );
};

const wrapStyle: ViewStyle = { gap: theme.spacing.sm, marginBottom: theme.spacing.lg };
const backStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', minHeight: 24 };
const backTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontWeight: '600', color: theme.colors.primary }));
const rowStyle: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: theme.spacing.md };
const textBlockStyle: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: 280, gap: 2 };
const rightStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flexWrap: 'wrap' };
const captionStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontWeight: '600', color: theme.colors.textMuted }));
const titleStyle: TextStyle = themed(() => ({ ...theme.textStyles.h1, color: theme.colors.textPrimary }));
const subtitleStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontSize: 15, color: theme.colors.textSecondary }));
