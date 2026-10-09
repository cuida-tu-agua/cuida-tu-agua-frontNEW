import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { HttpPushRepository } from '../HttpPushRepository';

const httpError = (status: number, data: unknown): AxiosError => {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, {}, response);
};

describe('HttpPushRepository', () => {
  it('registers the token with its platform', async () => {
    const post = jest.fn().mockResolvedValue({ status: 204 });
    await new HttpPushRepository({ post } as unknown as AxiosInstance).register({ token: 'ExponentPushToken[a]', platform: 'ios' });

    expect(post).toHaveBeenCalledWith('/api/push-tokens', { token: 'ExponentPushToken[a]', platform: 'ios' });
  });

  it('unregisters sending the token in the body of the DELETE', async () => {
    const del = jest.fn().mockResolvedValue({ status: 204 });
    await new HttpPushRepository({ delete: del } as unknown as AxiosInstance).unregister('ExponentPushToken[a]');

    expect(del).toHaveBeenCalledWith('/api/push-tokens', { data: { token: 'ExponentPushToken[a]' } });
  });

  it('turns a server refusal into an app error', async () => {
    const post = jest.fn().mockRejectedValue(httpError(400, { title: 'push.invalid_token', detail: 'bad' }));

    await expect(new HttpPushRepository({ post } as unknown as AxiosInstance).register({ token: 'x', platform: 'android' }))
      .rejects.toMatchObject({ message: expect.any(String) });
  });
});
