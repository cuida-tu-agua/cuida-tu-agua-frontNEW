import React from 'react';
import { Platform, RefreshControlProps, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { CONTENT_MAX_WIDTH } from '../../layout/breakpoints';
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
 * The page frame every screen shares: background, scroll, and (on the web) the generous padding and a column that
 * starts on the left edge, the same as the title of every page (Consejos favoritos). The app shell already centers
 * the whole content area. On a phone it only adds the usual screen padding.
 */
export const PageContainer: React.FC<PageContainerProps> = ({ children, narrow = false, medium = false, scroll = true, gap, contentStyle, refreshControl }) => {
  const web = Platform.OS === 'web';
  const maxWidth = !web ? undefined : narrow ? NARROW_WIDTH : medium ? MEDIUM_WIDTH : undefined;
  // The page column: the same on every screen, so the titles start on the same line
  const page: ViewStyle = { width: '100%', maxWidth: web ? CONTENT_MAX_WIDTH : undefined, alignSelf: 'center' };
  const column: ViewStyle = { width: '100%', maxWidth, alignSelf: 'flex-start', gap };

  if (!scroll) {
    return (
      <View style={[screenStyle, web && webPadStyle, contentStyle]}>
        <View style={[page, { flex: 1 }]}>
          <View style={[column, { flex: 1 }]}>{children}</View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={screenStyle}
      contentContainerStyle={[phonePadStyle, web && webPadStyle, contentStyle]}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
    >
      <View style={page}>
        <View style={column}>{children}</View>
      </View>
    </ScrollView>
  );
};

const screenStyle: ViewStyle = themed(() => ({ flex: 1, backgroundColor: theme.colors.background }));
const phonePadStyle: ViewStyle = { padding: theme.spacing.lg, paddingBottom: theme.spacing.huge };
const webPadStyle: ViewStyle = { paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.xl };

/**
 * For screens that bring their own FlatList: the same column as PageContainer (the padding is part of the column,
 * so the content starts on the same line as the titles) and the web padding through contentContainerStyle.
 */
export const listContentStyle = (): ViewStyle =>
  Platform.OS === 'web'
    ? {
        width: '100%',
        maxWidth: CONTENT_MAX_WIDTH + theme.spacing.xl * 2,
        alignSelf: 'center',
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.xl,
      }
    : {};
