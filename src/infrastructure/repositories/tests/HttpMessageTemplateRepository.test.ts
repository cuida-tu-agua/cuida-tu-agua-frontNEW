import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { HttpMessageTemplateRepository } from '../HttpMessageTemplateRepository';

const httpError = (status: number, data: unknown): AxiosError => {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, {}, response);
};

const template = { key: 'ALERT_CRITICAL', body: 'Alerta {title}', defaultBody: 'x', isCustom: true, placeholders: [], maxLength: 320, updatedAt: null };

describe('HttpMessageTemplateRepository', () => {
  it('lists, saves and restores the texts of the administrator', async () => {
    const http = {
      get: jest.fn().mockResolvedValue({ data: [template] }),
      put: jest.fn().mockResolvedValue({ data: template }),
      delete: jest.fn().mockResolvedValue({ data: { ...template, isCustom: false } }),
    };
    const repo = new HttpMessageTemplateRepository(http as unknown as AxiosInstance);

    expect(await repo.list()).toHaveLength(1);
    expect(http.get).toHaveBeenCalledWith('/api/admin/message-templates');

    await repo.save('ALERT_CRITICAL', 'Alerta {title}');
    expect(http.put).toHaveBeenCalledWith('/api/admin/message-templates/ALERT_CRITICAL', { body: 'Alerta {title}' });

    expect((await repo.reset('ALERT_CRITICAL')).isCustom).toBe(false);
    expect(http.delete).toHaveBeenCalledWith('/api/admin/message-templates/ALERT_CRITICAL');
  });

  it('reads the text of the guest link for any user', async () => {
    const http = { get: jest.fn().mockResolvedValue({ data: { ...template, key: 'GUEST_LINK_SHARE' } }) };

    await new HttpMessageTemplateRepository(http as unknown as AxiosInstance).shared('GUEST_LINK_SHARE');

    expect(http.get).toHaveBeenCalledWith('/api/message-templates/GUEST_LINK_SHARE');
  });

  it('an invalid text comes back as an error with the reason of the server', async () => {
    const http = { put: jest.fn().mockRejectedValue(httpError(400, { title: 'message_template.invalid', detail: 'The text must keep {code}.' })) };

    const error = await new HttpMessageTemplateRepository(http as unknown as AxiosInstance).save('PHONE_CODE', 'x').catch((e) => e);

    expect(error.code).toBe('message_template.invalid');
  });
});
