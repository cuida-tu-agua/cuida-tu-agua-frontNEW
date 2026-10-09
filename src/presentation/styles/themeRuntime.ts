import { ColorTokens, ThemeName, paletteFor } from './palettes';

/**
 * The live theme. Screens write their styles once, at module level (`const cardStyle = {...theme.colors.surface}`),
 * so a color read at that moment would be frozen forever. Two pieces keep the four themes switchable without
 * rewriting every screen:
 *
 *  - `colors`: an object whose properties are read from the CURRENT palette each time they are accessed.
 *  - `themed(factory)`: a style object that re-runs its factory the first time it is read after the theme changed.
 *
 * Changing the theme calls setThemeName(); the app then remounts its screens (ThemeBoundary), they read their styles
 * again and get the new colors.
 */

let current: ThemeName = 'classic-light';
let version = 0;

export const getThemeName = (): ThemeName => current;

/** Increases with every real theme change: caches compare it. */
export const getThemeVersion = (): number => version;

/** Returns true when the theme really changed. */
export const setThemeName = (name: ThemeName): boolean => {
  if (name === current) return false;
  current = name;
  version += 1;
  return true;
};

/** The current palette, as plain values (for libraries that need a real object, like the navigation theme). */
export const currentPalette = (): ColorTokens => paletteFor(current);

const PALETTE_KEYS = Object.keys(paletteFor('classic-light')) as (keyof ColorTokens)[];

export const colors: ColorTokens = new Proxy({} as ColorTokens, {
  get: (_target, key) => (typeof key === 'string' ? paletteFor(current)[key as keyof ColorTokens] : undefined),
  has: (_target, key) => PALETTE_KEYS.includes(key as keyof ColorTokens),
  ownKeys: () => [...PALETTE_KEYS],
  getOwnPropertyDescriptor: (_target, key) =>
    PALETTE_KEYS.includes(key as keyof ColorTokens)
      ? { enumerable: true, configurable: true, writable: false, value: paletteFor(current)[key as keyof ColorTokens] }
      : undefined,
  set: () => false,
});

/**
 * A style (or a table of styles / an array) that depends on the theme. The factory runs the first time the object is
 * read and again only after the theme changed (or after `variant()` returned something else, for values that also
 * depend on the screen width).
 */
export function themed<T extends object>(factory: () => T, variant: () => unknown = () => 0): T {
  let cacheVersion = -1;
  let cacheVariant: unknown;
  let cache: T;

  const read = (): T => {
    const v = variant();
    if (cacheVersion !== version || cacheVariant !== v) {
      cache = factory();
      cacheVersion = version;
      cacheVariant = v;
    }
    return cache;
  };

  // The target decides what Array.isArray() says; the traps forward everything else to the live value
  const target = (Array.isArray(read()) ? [] : {}) as T;

  return new Proxy(target, {
    get: (_t, key) => {
      const value = Reflect.get(read(), key);
      return typeof value === 'function' ? value.bind(read()) : value;
    },
    has: (_t, key) => key in read(),
    ownKeys: () => Reflect.ownKeys(read()).filter((k) => !Array.isArray(target) || k !== 'length'),
    getOwnPropertyDescriptor: (_t, key) => {
      const descriptor = Reflect.getOwnPropertyDescriptor(read(), key);
      return descriptor ? { ...descriptor, configurable: true } : undefined;
    },
    set: () => false,
  });
}
