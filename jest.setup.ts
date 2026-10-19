import { act } from 'react-test-renderer';
import i18n, { changeLanguage } from './src/i18n';

// The test environment reports an English device, but the existing tests check the Spanish texts
// (Spanish is the default language of the app). Tests that need English call changeLanguage('en') themselves.
// Wrapped in act(): a tree left mounted by the previous test re-renders when the language changes.
beforeEach(async () => {
  if (i18n.language === 'es') return;
  await act(async () => {
    await changeLanguage('es');
  });
});
