/**
 * Spanish dictionary: the original language of the app and the reference for the others.
 * Keys are written in English and grouped by area; the values are what the user reads.
 * Every key added here must also exist in en.ts (the compiler and the tests check it).
 */
export const es = {
  common: {
    appName: 'Cuida Tu Agua',
    loading: 'Cargando...',
    cancel: 'Cancelar',
    save: 'Guardar',
    back: 'Volver',
    retry: 'Reintentar',
  },
  language: {
    title: 'Idioma',
    label: 'Idioma de la aplicación',
    hint: 'El cambio se aplica al instante y se recuerda en este dispositivo.',
  },
};

/** The shape of a dictionary: same keys as Spanish, any text as value. */
export type DeepString<T> = { [K in keyof T]: T[K] extends string ? string : DeepString<T[K]> };
export type Translations = DeepString<typeof es>;
