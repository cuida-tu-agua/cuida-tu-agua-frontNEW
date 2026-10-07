import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { alertRepository } from '../../../core/di/container';
import { AppError } from '../../../domain/common/AppError';
import { sampleAlerts } from '../../../infrastructure/repositories/InMemoryAlertRepository';
import { NotificationsScreen } from '../alerts/NotificationsScreen';

// The screen talks to the repository of the container; here it is a fake we control.
jest.mock('../../../core/di/container', () => ({
  alertRepository: { list: jest.fn(), markAsRead: jest.fn(), remove: jest.fn() },
}));
// useFocusEffect runs like a normal effect (the screen is always "focused" in these tests).
jest.mock('@react-navigation/native', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { useFocusEffect: (effect: () => void | (() => void)) => React.useEffect(effect, [effect]) };
});
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

jest.useFakeTimers();

const repository = alertRepository as unknown as { list: jest.Mock; markAsRead: jest.Mock; remove: jest.Mock };

const texts = (tree: ReactTestRenderer) =>
  tree.root
    .findAll((n) => (n.type as unknown) === 'Text')
    .map((n) => n.children.filter((c) => typeof c === 'string').join(''))
    .join(' | ');

const renderers: ReactTestRenderer[] = [];

const openScreen = async () => {
  let tree!: ReactTestRenderer;
  await act(async () => {
    tree = create(<NotificationsScreen navigation={{} as never} route={{} as never} />);
  });
  renderers.push(tree);
  return tree;
};

const press = async (tree: ReactTestRenderer, find: (props: Record<string, unknown>) => boolean) => {
  const target = tree.root.findAll((n) => find(n.props) && typeof n.props.onPress === 'function');
  await act(async () => {
    await target[0].props.onPress();
  });
};

const byLabel = (label: string) => (p: Record<string, unknown>) => p.accessibilityLabel === label;
const byButton = (label: string) => (p: Record<string, unknown>) => p.label === label;

beforeEach(() => {
  repository.list.mockReset().mockResolvedValue(sampleAlerts());
  repository.markAsRead.mockReset().mockResolvedValue(undefined);
  repository.remove.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  renderers.splice(0).forEach((r) => act(() => r.unmount()));
});

describe('NotificationsScreen', () => {
  it('lists the alerts from the newest to the oldest, with the unread count', async () => {
    const shown = texts(await openScreen());

    expect(shown).toContain('2 sin leer');
    // sample alerts: leak (1 h ago) < valve closed (5 h ago) < sensor (26 h ago) < goal (72 h ago)
    const order = ['Fuga sospechosa', 'Válvula cerrada', 'Sensor desconectado', 'Cerca de la meta'].map((t) => shown.indexOf(t));
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(order.every((i) => i >= 0)).toBe(true);
  });

  it('shows the place of each alert', async () => {
    const shown = texts(await openScreen());
    expect(shown).toContain('Casa');
    expect(shown).toContain('Local');
  });

  it('marks an alert as read and updates the counter', async () => {
    const tree = await openScreen();

    await press(tree, byLabel('Marcar como leída'));

    expect(repository.markAsRead).toHaveBeenCalledTimes(1);
    expect(texts(tree)).toContain('1 sin leer');
  });

  it('asks before deleting, and deletes when the user confirms', async () => {
    const tree = await openScreen();

    await press(tree, byLabel('Eliminar alerta'));
    expect(texts(tree)).toContain('¿Eliminar esta alerta?');
    expect(repository.remove).not.toHaveBeenCalled();

    await press(tree, byButton('Sí, eliminar'));

    expect(repository.remove).toHaveBeenCalledTimes(1);
    expect(texts(tree)).not.toContain('Fuga sospechosa'); // the newest one was the first row
  });

  it('does not delete when the user cancels', async () => {
    const tree = await openScreen();

    await press(tree, byLabel('Eliminar alerta'));
    await press(tree, byButton('No, conservarla'));

    expect(repository.remove).not.toHaveBeenCalled();
    expect(texts(tree)).toContain('Fuga sospechosa');
  });

  it('tells the user when marking as read fails, and the alert stays unread', async () => {
    repository.markAsRead.mockRejectedValue(new AppError('server', 'Intenta de nuevo'));
    const tree = await openScreen();

    await press(tree, byLabel('Marcar como leída'));

    expect(texts(tree)).toContain('No pudimos marcar la alerta como leída. Intenta de nuevo');
    expect(texts(tree)).toContain('2 sin leer');
  });

  it('shows a friendly message when there are no alerts', async () => {
    repository.list.mockResolvedValue([]);
    expect(texts(await openScreen())).toContain('No tienes alertas');
  });

  it('shows the error and a retry button when the first load fails', async () => {
    repository.list.mockRejectedValue(new AppError('network', 'Sin conexión'));
    const tree = await openScreen();

    expect(texts(tree)).toContain('Sin conexión');
    expect(texts(tree)).toContain('Reintentar');
  });
});
