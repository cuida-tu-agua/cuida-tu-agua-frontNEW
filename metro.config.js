const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/** "sywater-jsx" is not an npm package: it is the JSX runtime of the app (see babel.config.js). */
const JSX_RUNTIME = {
  'sywater-jsx/jsx-runtime': path.resolve(__dirname, 'src/presentation/styles/jsx/jsx-runtime.ts'),
  'sywater-jsx/jsx-dev-runtime': path.resolve(__dirname, 'src/presentation/styles/jsx/jsx-dev-runtime.ts'),
};

const defaultResolve = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const file = JSX_RUNTIME[moduleName];
  if (file) return { type: 'sourceFile', filePath: file };
  return (defaultResolve ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
