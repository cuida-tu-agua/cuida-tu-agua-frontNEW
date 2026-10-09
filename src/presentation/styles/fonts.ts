import React from 'react';
import { Platform, StyleSheet, Text, TextInput } from 'react-native';

/**
 * Two families (Manual visual, section 3.1): Manrope for titles and body, IBM Plex Mono only for data, labels and
 * units. Each weight is its own loaded font file, so the family is chosen BY WEIGHT:
 *   400 → Manrope_400Regular · 600 → Manrope_600SemiBold · 800 → Manrope_800ExtraBold · mono → IBMPlexMono_500Medium
 * (the files are loaded by App.tsx with expo-font; they work the same on Android, iOS and web).
 */
export const FONT = {
  regular: 'Manrope_400Regular',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_800ExtraBold',
  mono: 'IBMPlexMono_500Medium',
  monoRegular: 'IBMPlexMono_400Regular',
} as const;

const SYSTEM_STACK = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const MONO_STACK = "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace";

/** On web the family ends in a system font, so the text is readable while the file loads or if it fails. */
export const withFallback = (family: string): string =>
  Platform.OS !== 'web' ? family : `${family}, ${family.startsWith('IBM') ? MONO_STACK : SYSTEM_STACK}`;

/** The Manrope file that matches a CSS weight (400 regular, 500-600 semibold, 700+ extra bold). */
export const manropeForWeight = (weight: string | number | undefined): string => {
  const value = weight === 'bold' ? 700 : weight === 'normal' || weight === undefined ? 400 : Number(weight);
  if (!Number.isFinite(value) || value < 500) return FONT.regular;
  return value < 700 ? FONT.semibold : FONT.bold;
};

const isManrope = (family?: string) => !family || family.startsWith('Manrope');
const isMono = (family?: string) => !!family && family.startsWith('IBM');

const WEIGHT_OF_FAMILY: Record<string, number> = {
  [FONT.regular]: 400,
  [FONT.semibold]: 600,
  [FONT.bold]: 800,
};

/**
 * What a text with this family and weight must really use. A screen can still write `fontWeight: '800'` over a text
 * style: custom fonts have no synthetic bold on Android and a faux one on web, so the weight is turned into the right
 * file and removed.
 */
export const resolveFont = (
  family: string | undefined,
  weight: string | number | undefined,
): { fontFamily: string; fontWeight: 'normal' } => {
  if (isMono(family)) return { fontFamily: withFallback(family!.split(',')[0]), fontWeight: 'normal' };
  if (!isManrope(family)) return { fontFamily: family!, fontWeight: 'normal' };

  const own = family ? WEIGHT_OF_FAMILY[family.split(',')[0]] : undefined;
  const file = weight !== undefined ? manropeForWeight(weight) : own ? manropeForWeight(own) : FONT.regular;
  return { fontFamily: withFallback(file), fontWeight: 'normal' };
};

let installed = false;

type Renderable = { render?: (...args: unknown[]) => React.ReactElement };

const patch = (component: unknown) => {
  const target = component as Renderable;
  const original = target?.render;
  if (typeof original !== 'function') return;   // not a forwardRef component: leave it as it is

  target.render = function render(this: unknown, ...args: unknown[]) {
    const element = original.apply(this, args);
    if (!React.isValidElement(element)) return element;
    const props = element.props as { style?: unknown };
    const flat = (StyleSheet.flatten(props.style as never) ?? {}) as { fontFamily?: string; fontWeight?: string | number };
    return React.cloneElement(element as React.ReactElement<{ style?: unknown }>, {
      style: [props.style, resolveFont(flat.fontFamily, flat.fontWeight)],
    });
  };
};

/**
 * Makes EVERY Text and TextInput of the app use the brand fonts without touching each screen: a text without family
 * gets Manrope, and a `fontWeight` written on a screen picks the matching file. Safe to call twice.
 */
export const installFontPatch = (): void => {
  if (installed) return;
  installed = true;
  patch(Text);
  patch(TextInput);
};
