import * as runtime from 'react/jsx-runtime';
import { plainProps } from './liveValues';

/**
 * JSX runtime of the app (production builds). Babel compiles every `<View style={...}>` to a call to jsx() / jsxs();
 * babel.config.js points those calls here (jsxImportSource "sywater-jsx", resolved by metro.config.js). The only
 * difference with React's own runtime: live theme values become plain objects first (see ./liveValues.ts).
 */
export const Fragment = runtime.Fragment;

export const jsx: typeof runtime.jsx = (type, props, key) => runtime.jsx(type, plainProps(props), key);

export const jsxs: typeof runtime.jsxs = (type, props, key) => runtime.jsxs(type, plainProps(props), key);
