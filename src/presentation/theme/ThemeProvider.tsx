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
  }, [name, palette.background]);

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

/**
 * Remounts its children when the theme changes. The styles of the screens are recalculated when they are read; this
 * makes every mounted screen read them again, so the new colors show at once. (Navigation state is not touched: the
 * boundary lives INSIDE the navigation container, so the user stays on the same screen.)
 */
export const ThemeBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { name } = useAppTheme();
  return <React.Fragment key={name}>{children}</React.Fragment>;
};
