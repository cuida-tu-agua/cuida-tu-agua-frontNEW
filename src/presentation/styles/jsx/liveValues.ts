/**
 * Live values (the theme Proxies of themeRuntime.ts) and how to turn them into plain objects.
 *
 * Why: on Android / iOS, in development, React Native FREEZES every prop it receives in a native view
 * (deepFreezeAndThrowOnMutationInDev). A Proxy whose colors change with the theme cannot be frozen: the freeze fails
 * with "trap result is configurable but target property is non-configurable". The web never freezes, so it worked
 * there. The fix is to hand React Native the CURRENT plain value instead of the Proxy. That happens in one place, the
 * JSX runtime of the app (./jsx-runtime.ts), so no screen has to change.
 *
 * This module has no imports on purpose: the JSX runtime loads it before anything else of the app.
 */

/** Each live value (a Proxy) → the function that returns its current plain value. */
const readers = new WeakMap<object, () => unknown>();

/** Called by themeRuntime for every Proxy it creates. */
export const registerLiveValue = (proxy: object, read: () => unknown): void => {
  readers.set(proxy, read);
};

export const isLiveValue = (value: unknown): boolean =>
  typeof value === 'object' && value !== null && readers.has(value);

/**
 * The plain version of a style: a live value becomes its current snapshot, and a style array (which may hold live
 * values, even nested) is copied only if something inside it changed. Anything else is returned as it is.
 */
export const toPlain = <T>(value: T): T => {
  if (typeof value !== 'object' || value === null) return value;
  const read = readers.get(value);
  if (read) return toPlain(read() as T);
  if (!Array.isArray(value)) return value;

  let copy: unknown[] | null = null;
  for (let i = 0; i < value.length; i++) {
    const item = value[i];
    const plain = toPlain(item);
    if (plain !== item) {
      copy ??= value.slice();
      copy[i] = plain;
    }
  }
  return (copy ?? value) as T;
};

/** style, contentContainerStyle, columnWrapperStyle, imageStyle...: the props that may hold style arrays. */
const STYLE_PROP = /style$/i;

/**
 * The props of a JSX element with every live value replaced by its plain snapshot. Returns the SAME object when there
 * is nothing to replace (the usual case), so it costs a loop over the props and nothing else.
 */
export const plainProps = <P>(props: P): P => {
  if (typeof props !== 'object' || props === null) return props;
  let out: Record<string, unknown> | null = null;
  const source = props as Record<string, unknown>;

  for (const key in source) {
    const value = source[key];
    if (typeof value !== 'object' || value === null) continue;
    if (!readers.has(value) && !(Array.isArray(value) && STYLE_PROP.test(key))) continue;

    const plain = toPlain(value);
    if (plain !== value) {
      out ??= { ...source };
      out[key] = plain;
    }
  }
  return (out ?? props) as P;
};
