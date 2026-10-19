import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { HttpNotificationRepository } from '../HttpNotificationRepository';

const httpError = (status: number, data: unknown): AxiosError => {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, {}, response);
};

const item = (id: string) => ({ id, type: 'DEVICE_OFFLINE', severity: 'WARNING', title: 't', body: 'b', placeId: null,
  createdAt: '2026-10-09T10:00:00Z', isRead: false, readAt: null });

describe('HttpNotificationRepository', () => {
  it('lists with the cursor and says there is more when the page is full', async () => {
    const get = jest.fn().mockResolvedValue({ data: [item('1'), item('2')] });
    const repository = new HttpNotificationRepository({ get } as unknown as AxiosInstance);

    const page = await repository.list({ before: '2026-10-09T11:00:00Z', limit: 2 });

    expect(get).toHaveBeenCalledWith('/api/notifications', {
      params: { unreadOnly: undefined, before: '2026-10-09T11:00:00Z', limit: 2 },
    });
    expect(page.items).toHaveLength(2);
    expect(page.hasMore).toBe(true);
  });

  it('a short page is the end of the inbox', async () => {
    const get = jest.fn().mockResolvedValue({ data: [item('1')] });
    const repository = new HttpNotificationRepository({ get } as unknown as AxiosInstance);

    expect((await repository.list({ limit: 20, unreadOnly: true })).hasMore).toBe(false);
    expect(get).toHaveBeenCalledWith('/api/notifications', expect.objectContaining({
      params: expect.objectContaining({ unreadOnly: true }),
    }));
  });

  it('reads the number of the bell', async () => {
    const get = jest.fn().mockResolvedValue({ data: { count: 4 } });
    const repository = new HttpNotificationRepository({ get } as unknown as AxiosInstance);

    await expect(repository.unreadCount()).resolves.toBe(4);
    expect(get).toHaveBeenCalledWith('/api/notifications/unread-count');
  });

  it('marks one and all as read', async () => {
    const post = jest.fn()
      .mockResolvedValueOnce({ data: { ...item('9'), isRead: true } })
      .mockResolvedValueOnce({ data: { marked: 3 } });
    const repository = new HttpNotificationRepository({ post } as unknown as AxiosInstance);

    await expect(repository.markRead('9')).resolves.toMatchObject({ isRead: true });
    await expect(repository.markAllRead()).resolves.toBe(3);
    expect(post).toHaveBeenNthCalledWith(1, '/api/notifications/9/read');
    expect(post).toHaveBeenNthCalledWith(2, '/api/notifications/read-all');
  });

  it('reads the preferences and saves one level with its four switches', async () => {
    const level = { severity: 'WARNING', inApp: true, push: true, email: true, sms: false };
    const get = jest.fn().mockResolvedValue({ data: { levels: [level] } });
    const put = jest.fn().mockResolvedValue({ data: level });
    const repository = new HttpNotificationRepository({ get, put } as unknown as AxiosInstance);

    await expect(repository.getPreferences()).resolves.toEqual([level]);
    await repository.updatePreference(level as never);
    expect(put).toHaveBeenCalledWith('/api/notification-preferences/WARNING', { inApp: true, push: true, email: true, sms: false });
  });

  it('turning off the in-app channel of a critical level is explained', async () => {
    const put = jest.fn().mockRejectedValue(httpError(400, { title: 'preferences.critical_requires_in_app' }));
    const repository = new HttpNotificationRepository({ put } as unknown as AxiosInstance);

    const error = await repository
      .updatePreference({ severity: 'CRITICAL', inApp: false, push: true, email: true, sms: false })
      .catch((e) => e);
    expect(error.message).toBe('Las alertas críticas siempre se muestran en la app: no se puede apagar.');
  });

  it('a notification of someone else is a plain "not found"', async () => {
    const post = jest.fn().mockRejectedValue(httpError(404, { title: 'notification.not_found' }));
    const repository = new HttpNotificationRepository({ post } as unknown as AxiosInstance);

    const error = await repository.markRead('x').catch((e) => e);
    expect(error.kind).toBe('not_found');
    expect(error.message).toBe('Esa notificación ya no existe.');
  });
});
