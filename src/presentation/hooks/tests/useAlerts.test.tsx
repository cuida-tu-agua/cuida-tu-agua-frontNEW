import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { Alert } from '../../../domain/alerts/Alert';
import { AlertRepository } from '../../../domain/alerts/AlertRepository';
import { AppError } from '../../../domain/common/AppError';
import { useAlerts } from '../useAlerts';

// The hook only needs the repository we pass in, not the real network clients.
jest.mock('../../../core/di/container', () => ({ alertRepository: {} }));
// useFocusEffect runs like a normal effect (the screen is always "focused" in these tests).
jest.mock('@react-navigation/native', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { useFocusEffect: (effect: () => void | (() => void)) => React.useEffect(effect, [effect]) };
});

jest.useFakeTimers();

const alert = (overrides: Partial<Alert> = {}): Alert => ({
  id: 'a1',
  placeId: 'p1',
  alertType: 'SUSPECTED_LEAK',
  severity: 'CRITICAL',
  title: 'Posible fuga de agua',
  message: 'Agua corriendo sin parar',
  metadata: null,
  triggeredAt: '2026-10-03T15:00:00Z',
  readAt: null,
  ...overrides,
});

const repositoryWith = (alerts: Alert[], overrides: Partial<AlertRepository> = {}): AlertRepository => ({
  list: jest.fn().mockResolvedValue(alerts),
  markAsRead: jest.fn().mockResolvedValue(undefined),
  remove: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

type HookResult = ReturnType<typeof useAlerts>;

const renderers: ReactTestRenderer[] = [];

const setup = async (repository: AlertRepository) => {
  const result = { current: null as unknown as HookResult };
  const Harness = () => {
    result.current = useAlerts(repository);
    return null;
  };
  await act(async () => {
    renderers.push(create(<Harness />));
  });
  return result;
};

afterEach(() => {
  renderers.splice(0).forEach((r) => act(() => r.unmount()));
});

describe('useAlerts', () => {
  const older = alert({ id: 'older', triggeredAt: '2026-10-01T10:00:00Z' });
  const newer = alert({ id: 'newer', triggeredAt: '2026-10-03T10:00:00Z', readAt: '2026-10-03T11:00:00Z' });

  it('loads the alerts, newest first, with the unread count', async () => {
    const result = await setup(repositoryWith([older, newer]));

    expect(result.current.loading).toBe(false);
    expect(result.current.alerts.map((a) => a.id)).toEqual(['newer', 'older']);
    expect(result.current.unreadCount).toBe(1);
  });

  it('shows the error when the first load fails', async () => {
    const result = await setup(repositoryWith([], { list: jest.fn().mockRejectedValue(new AppError('network', 'Sin conexión')) }));

    expect(result.current.error?.message).toBe('Sin conexión');
    expect(result.current.alerts).toEqual([]);
  });

  it('marks as read right away and tells the service', async () => {
    const repository = repositoryWith([older]);
    const result = await setup(repository);

    await act(async () => {
      await result.current.markAsRead('older');
    });

    expect(repository.markAsRead).toHaveBeenCalledWith('older');
    expect(result.current.unreadCount).toBe(0);
  });

  it('goes back and throws when the service refuses to mark as read', async () => {
    const repository = repositoryWith([older], { markAsRead: jest.fn().mockRejectedValue(new AppError('server', 'Falló')) });
    const result = await setup(repository);

    let thrown: unknown;
    await act(async () => {
      thrown = await result.current.markAsRead('older').catch((e) => e);
    });

    expect(thrown).toBeInstanceOf(AppError);
    expect(result.current.unreadCount).toBe(1); // the alert is unread again
  });

  it('deletes an alert', async () => {
    const repository = repositoryWith([older, newer]);
    const result = await setup(repository);

    await act(async () => {
      await result.current.remove('older');
    });

    expect(repository.remove).toHaveBeenCalledWith('older');
    expect(result.current.alerts.map((a) => a.id)).toEqual(['newer']);
  });

  it('keeps it deleted if the alert was already gone (not_found)', async () => {
    const gone = new AppError('not_found', 'Ya no existe', {}, { code: 'alert.not_found' });
    const result = await setup(repositoryWith([older], { remove: jest.fn().mockRejectedValue(gone) }));

    await act(async () => {
      await result.current.remove('older'); // does not throw
    });

    expect(result.current.alerts).toEqual([]);
  });

  it('asks again every minute while visible', async () => {
    const repository = repositoryWith([older]);
    await setup(repository);
    expect(repository.list).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });

    expect(repository.list).toHaveBeenCalledTimes(2);
  });
});
