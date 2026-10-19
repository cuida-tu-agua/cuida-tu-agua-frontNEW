import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { secureStorage } from '../../core/storage/secureStorage';
import { ColorTokens, ThemeMode, ThemeName, ThemeStyle, isDark, paletteFor, themeNameOf } from '../styles/palettes';
import { setThemeName } from '../styles/themeRuntime';

/** What the user chose. "system" follows the light / dark setting of the phone or the browser. */
export type ModePreference = ThemeMode | 'system';

export interface ThemePreference {
  style: ThemeStyle;
  mode: ModePreference;
}

export const DEFAULT_PREFERENCE: ThemePreference = { style: 'classic', mode: 'system' };

const STORAGE_KEY = 'theme.preference';
const AUTOFILL_STYLE_ID = 'theme-autofill';

/** A stored value that is not one of the options (an old version, a damaged entry) falls back to the default. */
export const parsePreference = (raw: string | null): ThemePreference => {
  if (!raw) return DEFAULT_PREFERENCE;
  try {
    const value = JSON.parse(raw) as Partial<ThemePreference>;
    const style: ThemeStyle = value.style === 'eco' ? 'eco' : 'classic';
    const mode: ModePreference = value.mode === 'light' || value.mode === 'dark' ? value.mode : 'system';
    return { style, mode };
  } catch {
    return DEFAULT_PREFERENCE;
  }
};

/** The theme that is really drawn: "system" becomes light or dark according to the device. */
export const resolveThemeName = (preference: ThemePreference, systemScheme: string | null | undefined): ThemeName =>
  themeNameOf(preference.style, preference.mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference.mode);

interface ThemeContextValue {
  preference: ThemePreference;
  /** The theme in use: classic-light, classic-dark, eco-light or eco-dark. */
  name: ThemeName;
  palette: ColorTokens;
  dark: boolean;
  /** false until the saved choice is read: the app shows its splash screen meanwhile (no flash of the wrong theme). */
  ready: boolean;
  setStyle: (style: ThemeStyle) => void;
  setMode: (mode: ModePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preference, setPreference] = useState<ThemePreference>(DEFAULT_PREFERENCE);
  const [ready, setReady] = useState(false);
  const systemScheme = useColorScheme();

  const name = resolveThemeName(preference, systemScheme);
  // The screens read their colors while they render, so the live theme must already be the right one at that moment
  setThemeName(name);

  useEffect(() => {
    let active = true;
    secureStorage
      .getItem(STORAGE_KEY)
      .catch(() => null)
      .then((raw) => {
        if (!active) return;
        setPreference(parsePreference(raw));
        setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // Every change starts from the LATEST preference (two changes in a row, like picking a tile that sets style and mode,
  // must not overwrite each other) and is saved once it is applied.
  const setStyle = useCallback((style: ThemeStyle) => setPreference((current) => ({ ...current, style })), []);
  const setMode = useCallback((mode: ModePreference) => setPreference((current) => ({ ...current, mode })), []);

  useEffect(() => {
    if (!ready) return; // do not overwrite the saved choice with the default while it is still being read
    secureStorage.setItem(STORAGE_KEY, JSON.stringify(preference)).catch(() => undefined); // not saving only loses the choice
  }, [preference, ready]);

  const palette = paletteFor(name);

  // Web: the page behind the app (overscroll, loading) and the browser controls follow the theme too
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.documentElement.style.backgroundColor = palette.background;
    document.documentElement.style.colorScheme = isDark(name) ? 'dark' : 'light';
    document.body.style.backgroundColor = palette.background;
    // When the browser fills a field (saved password, suggestion), the input and the whole bar of the field (icons
    // and eye included, marked with testID "field-bar") take the same color, in every theme.
    document.documentElement.style.setProperty('--field-autofill', palette.infoBg);
    document.documentElement.style.setProperty('--field-text', palette.textPrimary);
    if (!document.getElementById(AUTOFILL_STYLE_ID)) {
      const style = document.createElement('style');
      style.id = AUTOFILL_STYLE_ID;
      style.textContent =
        'input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus{' +
        '-webkit-box-shadow:0 0 0 1000px var(--field-autofill) inset !important;' +
        '-webkit-text-fill-color:var(--field-text) !important;transition:background-color 9999s ease-in-out 0s;}' +
        '[data-testid="field-bar"]:has(input:-webkit-autofill){background-color:var(--field-autofill) !important;}';
      document.head.appendChild(style);
    }
  }, [name, palette.background, palette.infoBg, palette.textPrimary]);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, name, palette, dark: isDark(name), ready, setStyle, setMode }),
    [preference, name, palette, ready, setStyle, setMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={value.dark ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used inside <ThemeProvider>.');
  return context;
};

const themeAwareCache = new WeakMap<object, React.FC<any>>();

/**
 * A screen that re-renders when the theme changes. React Navigation does not re-render its screens on a context change,
 * so each screen subscribes to the theme here. The wrapper is cached per screen: the same component type on every
 * render, so nothing remounts (the scroll and the form data stay).
 */
export const themeAware = <P extends object>(Component: React.ComponentType<P>): React.FC<P> => {
  const cached = themeAwareCache.get(Component);
  if (cached) return cached as React.FC<P>;
  const Wrapped: React.FC<P> = (props) => {
    useAppTheme(); // the subscription: a new theme value renders this screen again
    return <Component {...props} />;
  };
  Wrapped.displayName = `themeAware(${Component.displayName ?? Component.name})`;
  themeAwareCache.set(Component, Wrapped);
  return Wrapped;
};
