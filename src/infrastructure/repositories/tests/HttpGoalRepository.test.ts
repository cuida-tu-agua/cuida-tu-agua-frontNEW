import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { HttpGoalRepository } from '../HttpGoalRepository';

const httpError = (status: number, data: unknown): AxiosError => {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, {}, response);
};

const answer = {
  placeId: 'p1',
  timeZone: 'America/Bogota',
  monthStart: '2026-10-01',
  daysInMonth: 31,
  daysLeft: 12,
  consumedLiters: '7600.000',
  hasGoal: true,
  targetLiters: '9500.000',
  percentage: 80.0,
  remainingLiters: '1900.000',
  status: 'WARNING',
  updatedAt: '2026-10-20T15:40:57Z',
};

describe('HttpGoalRepository', () => {
  it('reads the goal of the current month in the zone of the phone, with numbers', async () => {
    const get = jest.fn().mockResolvedValue({ data: answer });
    const repository = new HttpGoalRepository({ get } as unknown as AxiosInstance);

    const goal = await repository.get('p1', 'America/Bogota');

    expect(get).toHaveBeenCalledWith('/api/places/p1/goals/current', { params: { tz: 'America/Bogota' } });
    expect(goal.targetLiters).toBe(9500);
    expect(goal.consumedLiters).toBe(7600);
    expect(goal.remainingLiters).toBe(1900);
  });

  it('keeps the empty fields of a place without a goal as null', async () => {
    const get = jest.fn().mockResolvedValue({
      data: { ...answer, hasGoal: false, targetLiters: null, percentage: null, remainingLiters: null, status: null },
    });
    const goal = await new HttpGoalRepository({ get } as unknown as AxiosInstance).get('p1', 'America/Bogota');

    expect(goal.hasGoal).toBe(false);
    expect(goal.targetLiters).toBeNull();
    expect(goal.percentage).toBeNull();
  });

  it('sends the goal in liters', async () => {
    const put = jest.fn().mockResolvedValue({ data: answer });
    const repository = new HttpGoalRepository({ put } as unknown as AxiosInstance);

    await repository.set('p1', 12000, 'America/Bogota');

    expect(put).toHaveBeenCalledWith('/api/places/p1/goals/current', { targetLiters: 12000 }, { params: { tz: 'America/Bogota' } });
  });

  it('explains an invalid goal', async () => {
    const put = jest.fn().mockRejectedValue(httpError(400, { title: 'goal.invalid_target' }));
    const error = await new HttpGoalRepository({ put } as unknown as AxiosInstance).set('p1', 0, 'America/Bogota').catch((e) => e);

    expect(error.code).toBe('goal.invalid_target');
    expect(error.message).toMatch(/mayor que cero/);
  });
});
