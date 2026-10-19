import React from 'react';
import { Text, View } from 'react-native';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { darkColors, lightColors } from '../palettes';
import { colors, setThemeName, themed } from '../themeRuntime';
import { isLiveValue, plainProps, toPlain } from '../jsx/liveValues';
import { jsxDEV } from '../jsx/jsx-dev-runtime';
import { jsx } from '../jsx/jsx-runtime';

// The same function React Native runs on the props of every native view in development (Android / iOS)
// (in React Native 0.86 the module exports the function as `default`; older versions export it directly)
const freezeModule = require('react-native/Libraries/Utilities/deepFreezeAndThrowOnMutationInDev');
const deepFreeze: <T>(value: T) => T = freezeModule.default ?? freezeModule;

afterEach(() => {
  setThemeName('classic-light');
});

describe('the bug on the phone', () => {
  it('a theme Proxy cannot be frozen the way React Native freezes native props', () => {
    const card = themed(() => ({ backgroundColor: colors.surface, padding: 8 }));
    expect(() => deepFreeze({ style: card })).toThrow(/non-configurable|Cannot redefine property/);
  });
});

describe('plainProps / toPlain', () => {
  it('turns a theme style into its current plain object, which can be frozen', () => {
    const card = themed(() => ({ backgroundColor: colors.surface, padding: 8 }));
    expect(isLiveValue(card)).toBe(true);
    const props = plainProps({ style: card });
    expect(isLiveValue(props.style)).toBe(false);
    expect(props.style).toEqual({ backgroundColor: lightColors.surface, padding: 8 });
    expect(() => deepFreeze(props)).not.toThrow();
  });

  it('follows the theme: after a change the snapshot has the new colors', () => {
    const card = themed(() => ({ backgroundColor: colors.surface }));
    deepFreeze(plainProps({ style: card }));   // the old snapshot is frozen by React Native...
    setThemeName('classic-dark');
    expect(plainProps({ style: card }).style).toEqual({ backgroundColor: darkColors.surface }); // ...the new one is fresh
  });

  it('unwraps theme styles inside style arrays, even nested, and any *Style prop', () => {
    const a = themed(() => ({ color: colors.primary }));
    const b = themed(() => [{ margin: 1 }, a]);
    const props = plainProps({ style: [a, { padding: 2 }, [b, null]], contentContainerStyle: a, testID: 'x' });
    expect(props.style).toEqual([{ color: lightColors.primary }, { padding: 2 }, [[{ margin: 1 }, { color: lightColors.primary }], null]]);
    expect(props.contentContainerStyle).toEqual({ color: lightColors.primary });
    expect(() => deepFreeze(props)).not.toThrow();
  });

  it('returns the same props object when there is nothing to change', () => {
    const props = { style: [{ padding: 1 }], data: [1, 2, 3], onPress: () => undefined };
    expect(plainProps(props)).toBe(props);
    expect(toPlain(props.style)).toBe(props.style);
  });

  it('turns the live palette into a plain object too', () => {
    expect(isLiveValue(toPlain(colors))).toBe(false);
    expect(toPlain(colors)).toEqual(lightColors);
  });
});

describe('JSX runtime of the app', () => {
  it('jsx and jsxDEV create elements with plain styles', () => {
    const style = themed(() => ({ color: colors.textPrimary }));
    const prod = jsx(Text, { style, children: 'a' });
    const dev = jsxDEV(Text, { style: [style] }, undefined, false, undefined, undefined);
    expect(isLiveValue((prod.props as { style: unknown }).style)).toBe(false);
    expect((dev.props as { style: unknown[] }).style[0]).toEqual({ color: lightColors.textPrimary });
  });

  it('renders a screen written with theme styles: the native views only get plain objects', () => {
    const box = themed(() => ({ backgroundColor: colors.background }));
    const label = themed(() => ({ color: colors.textPrimary }));
    let tree!: ReactTestRenderer;
    act(() => {
      tree = create(
        <View style={box}>
          <Text style={[label, { fontSize: 12 }]}>Hola</Text>
        </View>,
      );
    });
    const hosts = tree.root.findAll((n) => typeof n.type === 'string');
    expect(hosts.length).toBeGreaterThan(0);
    for (const host of hosts) {
      const style = host.props.style as unknown;
      const parts = Array.isArray(style) ? style.flat(3) : [style];
      parts.forEach((part) => expect(isLiveValue(part)).toBe(false));
      expect(() => deepFreeze({ ...host.props })).not.toThrow();
    }
  });
});
