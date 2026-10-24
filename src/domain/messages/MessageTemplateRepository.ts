import { MessageTemplate, MessageTemplateKey } from './MessageTemplate';

export interface MessageTemplateRepository {
  /** Administrator: every text, with its default one. */
  list(): Promise<MessageTemplate[]>;
  /** Administrator: saves a new text (it applies to the next message). */
  save(key: MessageTemplateKey, body: string): Promise<MessageTemplate>;
  /** Administrator: back to the default text. */
  reset(key: MessageTemplateKey): Promise<MessageTemplate>;
  /** Any user: a text the app fills in itself (the guest link shared by WhatsApp). */
  shared(key: MessageTemplateKey): Promise<MessageTemplate>;
}
