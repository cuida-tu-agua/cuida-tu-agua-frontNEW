import { MessageTemplate, MessageTemplateKey, ShortMessageProviders, TestMessageResult } from './MessageTemplate';

export interface MessageTemplateRepository {
  /** Administrator: every text, with its default one. */
  list(): Promise<MessageTemplate[]>;
  /** Administrator: saves a new text (it applies to the next message). */
  save(key: MessageTemplateKey, body: string): Promise<MessageTemplate>;
  /** Administrator: back to the default text. */
  reset(key: MessageTemplateKey): Promise<MessageTemplate>;
  /** Any user: a text the app fills in itself (the guest link shared by WhatsApp). */
  shared(key: MessageTemplateKey): Promise<MessageTemplate>;
  /** Administrator: sends the text, with example data, to their own verified phone right now. */
  test(key: MessageTemplateKey): Promise<TestMessageResult>;
  /** Administrator: which provider SMS and WhatsApp use. */
  providers(): Promise<ShortMessageProviders>;
}
