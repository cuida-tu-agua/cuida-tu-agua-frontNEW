import i18n from '../../i18n';
export type TipCategory = 'RESIDENTIAL' | 'COMMERCIAL';

export const TIP_CATEGORIES: TipCategory[] = ['RESIDENTIAL', 'COMMERCIAL'];

export const CATEGORY_LABELS: Record<TipCategory, string> = {
  get RESIDENTIAL() {
    return i18n.t('tips.categories.RESIDENTIAL');
  },
  get COMMERCIAL() {
    return i18n.t('tips.categories.COMMERCIAL');
  },
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

  if (!title) errors.title = i18n.t('tips.validation.titleRequired');
  else if (title.length > TITLE_MAX) errors.title = i18n.t('tips.validation.titleTooLong', { max: TITLE_MAX });

  if (!body) errors.body = i18n.t('tips.validation.bodyRequired');
  else if (body.length > BODY_MAX) errors.body = i18n.t('tips.validation.bodyTooLong', { max: BODY_MAX });

  if (!form.category) errors.category = i18n.t('tips.validation.categoryRequired');

  if (Object.keys(errors).length > 0 || !form.category) return { errors, value: null };
  return { errors, value: { title, body, category: form.category } };
};

/** The favorite mark of a tip, flipped (for the optimistic update of the list). */
export const withFavorite = (tips: Tip[], id: string, isFavorite: boolean): Tip[] =>
  tips.map((tip) => (tip.id === id ? { ...tip, isFavorite } : tip));
