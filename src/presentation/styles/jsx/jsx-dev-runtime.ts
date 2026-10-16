import * as runtime from 'react/jsx-dev-runtime';
import { plainProps } from './liveValues';

/** JSX runtime of the app in development (`expo start`). Same as ./jsx-runtime.ts, with React's development function. */
export const Fragment = runtime.Fragment;

export const jsxDEV: typeof runtime.jsxDEV = (type, props, key, isStatic, source, self) =>
  runtime.jsxDEV(type, plainProps(props), key, isStatic, source, self);
