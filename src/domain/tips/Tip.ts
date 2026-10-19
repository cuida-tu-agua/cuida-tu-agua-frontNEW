export type TipCategory = 'RESIDENTIAL' | 'COMMERCIAL';

export const TIP_CATEGORIES: TipCategory[] = ['RESIDENTIAL', 'COMMERCIAL'];

export const CATEGORY_LABELS: Record<TipCategory, string> = {
  RESIDENTIAL: 'Residencial',
  COMMERCIAL: 'Comercial',
};

export const TITLE_MAX = 150;
export const BODY_MAX = 1000;

/** What a user sees (HU-065). */
export interface Tip {
  id: string;
  title: string;
  body: string;
  category: TipCategory;
  isFavorite: boolean;
}

/** The tips of one session: at least 3 different ones whenever that many exist. */
export interface TipsSession {
  category: TipCategory;
  total: number;
  tips: Tip[];
}

/** What an administrator sees (HU-063 / HU-064). */
export interface AdminTip {
  id: string;
  title: string;
  body: string;
  category: TipCategory;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string;
}

export interface TipInput {
  title: string;
  body: string;
  category: TipCategory;
}

export interface TipQuery {
  placeId?: string;
  category?: TipCategory;
  count?: number;
}

export interface TipForm {
  title: string;
  body: string;
  category: TipCategory | null;
}

export interface TipValidation {
  errors: Partial<Record<keyof TipForm, string>>;
  value: TipInput | null;
}

/** HU-063: the form asks for title, body and category. */
export const validateTip = (form: TipForm): TipValidation => {
  const errors: TipValidation['errors'] = {};
  const title = form.title.trim();
  const body = form.body.trim();

  if (!title) errors.title = 'Escribe un título.';
  else if (title.length > TITLE_MAX) errors.title = `El título tiene máximo ${TITLE_MAX} caracteres.`;

  if (!body) errors.body = 'Escribe el consejo.';
  else if (body.length > BODY_MAX) errors.body = `El consejo tiene máximo ${BODY_MAX} caracteres.`;

  if (!form.category) errors.category = 'Elige para qué tipo de lugar es.';

  if (Object.keys(errors).length > 0 || !form.category) return { errors, value: null };
  return { errors, value: { title, body, category: form.category } };
};

/** The favorite mark of a tip, flipped (for the optimistic update of the list). */
export const withFavorite = (tips: Tip[], id: string, isFavorite: boolean): Tip[] =>
  tips.map((tip) => (tip.id === id ? { ...tip, isFavorite } : tip));
