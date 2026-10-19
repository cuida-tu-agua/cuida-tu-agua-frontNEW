import i18n, { changeLanguage } from '../index';
import { DEFAULT_LANGUAGE, resolveLanguage } from '../languages';

describe('resolveLanguage: device language -> app language', () => {
  it('Spanish devices get Spanish, with or without a region', () => {
    expect(resolveLanguage('es')).toBe('es');
    expect(resolveLanguage('es-CO')).toBe('es');
    expect(resolveLanguage('ES_mx')).toBe('es');
  });

  it('English devices get English, with or without a region', () => {
    expect(resolveLanguage('en')).toBe('en');
    expect(resolveLanguage('en-US')).toBe('en');
    expect(resolveLanguage('EN-gb')).toBe('en');
  });

  it('French devices get French, with or without a region', () => {
    expect(resolveLanguage('fr')).toBe('fr');
    expect(resolveLanguage('fr-CA')).toBe('fr');
    expect(resolveLanguage('FR_be')).toBe('fr');
  });

  it('a language that is not supported falls back to Spanish', () => {
    expect(resolveLanguage('de')).toBe(DEFAULT_LANGUAGE);
    expect(resolveLanguage('pt-BR')).toBe(DEFAULT_LANGUAGE);
  });

  it('an unknown language falls back to Spanish', () => {
    expect(resolveLanguage(null)).toBe(DEFAULT_LANGUAGE);
    expect(resolveLanguage(undefined)).toBe(DEFAULT_LANGUAGE);
    expect(resolveLanguage('')).toBe(DEFAULT_LANGUAGE);
  });
});

describe('i18n instance', () => {
  afterEach(async () => {
    await changeLanguage('es');
  });

  it('is ready before the first screen is drawn', () => {
    expect(i18n.isInitialized).toBe(true);
  });

  it('shows the texts in Spanish', async () => {
    await changeLanguage('es');
    expect(i18n.t('common.cancel')).toBe('Cancelar');
  });

  it('shows the texts in English', async () => {
    await changeLanguage('en');
    expect(i18n.t('common.cancel')).toBe('Cancel');
  });

  it('shows the texts in French', async () => {
    await changeLanguage('fr');
    expect(i18n.t('common.cancel')).toBe('Annuler');
  });

  it('a text that exists only in Spanish is shown in Spanish when the language is English', async () => {
    i18n.addResource('es', 'translation', 'test.onlySpanish', 'Solo en español');
    await changeLanguage('en');
    expect(i18n.t('test.onlySpanish')).toBe('Solo en español');
  });
});
