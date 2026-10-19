import i18n from './src/i18n';

// The test environment reports an English device, but the existing tests check the Spanish texts
// (Spanish is the default language of the app). Tests that need English call changeLanguage('en') themselves.
beforeEach(async () => {
  await i18n.changeLanguage('es');
});
