import i18n from '../../i18n';

/** The WhatsApp / SMS texts the administrator can rewrite (ms-notification keeps them). */
export type MessageTemplateKey = 'ALERT_CRITICAL' | 'PHONE_CODE' | 'COLLABORATOR_INVITATION' | 'GUEST_LINK_SHARE';

export const MESSAGE_TEMPLATE_KEYS: MessageTemplateKey[] = ['ALERT_CRITICAL', 'PHONE_CODE', 'COLLABORATOR_INVITATION', 'GUEST_LINK_SHARE'];

export interface MessagePlaceholder {
  name: string;
  /** What goes in the text, e.g. "{place}". */
  token: string;
  required: boolean;
}

export interface MessageTemplate {
  key: MessageTemplateKey;
  /** The text in use right now. */
  body: string;
  defaultBody: string;
  isCustom: boolean;
  placeholders: MessagePlaceholder[];
  maxLength: number;
  updatedAt: string | null;
}

export const BRAND = 'Cuida Tu Agua';

/** One SMS holds 160 characters (without accents); longer texts go in two. */
export const SMS_SEGMENT = 160;

const PLACEHOLDER = /\{([^{}]*)\}/g;

/** Fills the placeholders; {app} is always the brand and a missing value leaves its placeholder empty. */
export const renderMessage = (body: string, values: Record<string, string | undefined>): string =>
  body
    .replace(PLACEHOLDER, (_, name: string) => (name === 'app' ? BRAND : (values[name] ?? '').replace(/[\r\n\t]+/g, ' ').trim()))
    .trim();

/** Same rules ms-notification applies when saving: the error text, or null when the text can be used. */
export const validateMessage = (template: Pick<MessageTemplate, 'placeholders' | 'maxLength'>, body: string): string | null => {
  const text = body.trim();
  if (!text) return i18n.t('messages.errors.empty');
  if (text.length > template.maxLength) return i18n.t('messages.errors.tooLong', { max: template.maxLength });
  if ((text.match(/\{/g) ?? []).length !== (text.match(/\}/g) ?? []).length) return i18n.t('messages.errors.unclosed');

  const allowed = new Set(template.placeholders.map((p) => p.name));
  for (const match of text.matchAll(PLACEHOLDER)) {
    if (!allowed.has(match[1])) {
      return i18n.t('messages.errors.unknown', { token: match[0], allowed: template.placeholders.map((p) => p.token).join(', ') });
    }
  }
  const missing = template.placeholders.filter((p) => p.required && !text.includes(p.token)).map((p) => p.token);
  return missing.length ? i18n.t('messages.errors.required', { tokens: missing.join(', ') }) : null;
};

/** How many SMS the finished text takes (WhatsApp has no such limit). */
export const smsCount = (text: string): number => Math.max(1, Math.ceil(text.length / SMS_SEGMENT));

/** Opens WhatsApp (app or web) with the text ready to send, to whoever the person picks there. */
export const whatsAppShareUrl = (text: string): string => `https://wa.me/?text=${encodeURIComponent(text)}`;

/** Example values for the preview of the administrator (in the active language). */
export const sampleValues = (): Record<string, string> => ({
  title: i18n.t('messages.sample.title'),
  place: i18n.t('messages.sample.place'),
  code: '123456',
  minutes: '5',
  inviter: i18n.t('messages.sample.inviter'),
  permissions: i18n.t('messages.sample.permissions'),
  expires: i18n.t('messages.sample.expires'),
  owner: i18n.t('messages.sample.owner'),
  link: 'https://cuidatuagua.app/guest/AbC123',
});

/** Getters: the text follows the language active when it is read. */
export const messageTitle = (key: MessageTemplateKey): string => i18n.t(`messages.keys.${key}.title`);
export const messageDescription = (key: MessageTemplateKey): string => i18n.t(`messages.keys.${key}.description`);
export const placeholderLabel = (name: string): string =>
  i18n.exists(`messages.placeholders.${name}`) ? i18n.t(`messages.placeholders.${name}`) : name;
