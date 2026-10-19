import React from 'react';
import { Platform, RefreshControlProps, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { theme } from '../../styles/theme';
import { themed } from '../../styles/themeRuntime';

/** Width of the column of a form page on the web (Figma: the forms are a narrow centered column). */
export const NARROW_WIDTH = 720;
/** Lists and detail pages (inbox, meter, history): a little wider than a form. */
export const MEDIUM_WIDTH = 880;

interface PageContainerProps {
  children: React.ReactNode;
  /** Forms and settings: a narrow centered column. Dashboards and lists use the whole content width. */
  narrow?: boolean;
  /** A wider column for lists and detail pages. */
  medium?: boolean;
  /** false = no scrolling here (the child brings its own list). */
  scroll?: boolean;
  /** Space between the children (the screens used it in their old scroll content). */
  gap?: number;
  contentStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

/**
 * The page frame every screen shares: background, scroll, and (on the web) the generous padding and the centered
 * column of the Figma boards. On a phone it only adds the usual screen padding.
 */
export const PageContainer: React.FC<PageContainerProps> = ({ children, narrow = false, medium = false, scroll = true, gap, contentStyle, refreshControl }) => {
  const web = Platform.OS === 'web';
  const maxWidth = !web ? undefined : narrow ? NARROW_WIDTH : medium ? MEDIUM_WIDTH : undefined;
  const column: ViewStyle = { width: '100%', maxWidth, gap };

  if (!scroll) {
    return (
      <View style={[screenStyle, web && webPadStyle, { alignItems: 'center' }, contentStyle]}>
        <View style={[column, { flex: 1 }]}>{children}</View>
      </View>
    );
  }

  return (
    <ScrollView
      style={screenStyle}
      contentContainerStyle={[phonePadStyle, web && webPadStyle, { alignItems: 'center' }, contentStyle]}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
    >
      <View style={column}>{children}</View>
    </ScrollView>
  );
};

const screenStyle: ViewStyle = themed(() => ({ flex: 1, backgroundColor: theme.colors.background }));
const phonePadStyle: ViewStyle = { padding: theme.spacing.lg, paddingBottom: theme.spacing.huge };
const webPadStyle: ViewStyle = { paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.xl };

/** For screens that bring their own FlatList: the same centered column and web padding through contentContainerStyle. */
export const listContentStyle = (width: number = MEDIUM_WIDTH): ViewStyle =>
  Platform.OS === 'web'
    ? { width: '100%', maxWidth: width + theme.spacing.xl * 2, alignSelf: 'center', paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.xl }
    : {};
