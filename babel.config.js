/**
 * Default Expo preset, with ONE change: JSX is compiled against the app's own runtime ("sywater-jsx", see
 * src/presentation/styles/jsx/). It gives React Native plain style objects instead of the live theme Proxies, which
 * the phone cannot freeze in development. metro.config.js says where "sywater-jsx" lives; the Jest config in
 * package.json does the same for the tests.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'sywater-jsx' }]],
  };
};
