import { AxiosInstance } from 'axios';
import { MESSAGE_TEMPLATE_ENDPOINTS } from '../../config/api';
import { MessageTemplate, MessageTemplateKey } from '../../domain/messages/MessageTemplate';
import { MessageTemplateRepository } from '../../domain/messages/MessageTemplateRepository';
import { toAppError } from '../http/httpError';

/** ms-notification: the WhatsApp / SMS texts of the administration panel. */
export class HttpMessageTemplateRepository implements MessageTemplateRepository {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  async list(): Promise<MessageTemplate[]> {
    try {
      const { data } = await this.http.get<MessageTemplate[]>(MESSAGE_TEMPLATE_ENDPOINTS.ADMIN);
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async save(key: MessageTemplateKey, body: string): Promise<MessageTemplate> {
    try {
      const { data } = await this.http.put<MessageTemplate>(MESSAGE_TEMPLATE_ENDPOINTS.ADMIN_ONE(key), { body });
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async reset(key: MessageTemplateKey): Promise<MessageTemplate> {
    try {
      const { data } = await this.http.delete<MessageTemplate>(MESSAGE_TEMPLATE_ENDPOINTS.ADMIN_ONE(key));
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async shared(key: MessageTemplateKey): Promise<MessageTemplate> {
    try {
      const { data } = await this.http.get<MessageTemplate>(MESSAGE_TEMPLATE_ENDPOINTS.SHARED(key));
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }
}
