import { useWindowDimensions } from 'react-native';

/**
 * One project, three layouts. The width of the window decides, not the platform: a phone in landscape, a tablet and
 * a narrow browser window all get the layout that fits them.
 *  - compact:  < 768   phone. One column, no side menu (the stack navigator is the menu).
 *  - medium:   768-1023 tablet / small window. Side menu collapsed to icons.
 *  - expanded: >= 1024  desktop. Full side menu and the content in a centered column.
 */
export type LayoutSize = 'compact' | 'medium' | 'expanded';

export const BREAKPOINTS = { medium: 768, expanded: 1024 } as const;

/** Widest the content column grows on a big monitor: wider lines of text are tiring to read. */
export const CONTENT_MAX_WIDTH = 1120;

export const layoutFor = (width: number): LayoutSize =>
  width >= BREAKPOINTS.expanded ? 'expanded' : width >= BREAKPOINTS.medium ? 'medium' : 'compact';

export const SIDEBAR_WIDTH = 248;
export const RAIL_WIDTH = 76;

/** Room the screens really have: the window minus the side menu, never wider than the centered column. */
export const contentWidthFor = (width: number): number => {
  const size = layoutFor(width);
  if (size === 'compact') return width;
  return Math.min(width - (size === 'medium' ? RAIL_WIDTH : SIDEBAR_WIDTH), CONTENT_MAX_WIDTH);
};

/** Narrowest a card of a grid may get before its text starts to be cut. */
export const MIN_CARD_WIDTH = 320;

/** How many cards of a grid fit in a row of that width (1 to 3). */
export const columnsFor = (contentWidth: number): number =>
  Math.max(1, Math.min(3, Math.floor((contentWidth - 32) / MIN_CARD_WIDTH)));

export const useLayout = () => {
  const { width, height } = useWindowDimensions();
  const size = layoutFor(width);
  const contentWidth = contentWidthFor(width);
  return { width, height, size, contentWidth, isCompact: size === 'compact', isExpanded: size === 'expanded', columns: columnsFor(contentWidth) };
};
