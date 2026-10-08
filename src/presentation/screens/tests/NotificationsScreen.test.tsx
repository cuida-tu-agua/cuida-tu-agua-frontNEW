import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { alertRepository, placeRepository } from '../../../core/di/container';
import { AppError } from '../../../domain/common/AppError';
import { sampleAlerts } from '../../../infrastructure/repositories/InMemoryAlertRepository';
import { NotificationsScreen } from '../alerts/NotificationsScreen';

// The screen talks to the repository of the container; here it is a fake we control.
jest.mock('../../../core/di/container', () => ({
  alertRepository: { list: jest.fn(), markAsRead: jest.fn(), remove: jest.fn() },
  placeRepository: { list: jest.fn() },
}));
// useFocusEffect runs like a normal effect (the screen is always "focused" in these tests).
jest.mock('@react-navigation/native', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { useFocusEffect: (effect: () => void | (() => void)) => React.useEffect(effect, [effect]) };
});
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

jest.useFakeTimers();
// The first render of the screen is slow when Jest has no cache yet (first full run), so these
// async tests get more than the default 5 s. Warm, they take milliseconds.
jest.setTimeout(30_000);

const repository = alertRepository as unknown as { list: jest.Mock; markAsRead: jest.Mock; remove: jest.Mock };
const places = placeRepository as unknown as { list: jest.Mock };

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
  places.list.mockReset().mockResolvedValue([
    { id: 'place-1', name: 'Casa' },
    { id: 'place-2', name: 'Local' },
  ]);
});

afterEach(() => {
  renderers.splice(0).forEach((r) => act(() => r.unmount()));
});

describe('NotificationsScreen', () => {
  it('lists the alerts from the newest to the oldest, with the unread count', async () => {
    const shown = texts(await openScreen());

    expect(shown).toContain('2 sin leer');
    // sample alerts: leak (1 h ago) < valve closed (5 h ago) < sensor (26 h ago) < goal (72 h ago)
    const order = ['Posible fuga de agua', 'Se cerró el paso del agua', 'Sensor desconectado', 'Vas en el 80% de tu meta'].map((t) =>
      shown.indexOf(t),
    );
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(order.every((i) => i >= 0)).toBe(true);
  });

  it('shows the kind and the place of each alert', async () => {
    const shown = texts(await openScreen());
    expect(shown).toContain('Fuga sospechosa · Casa');
    expect(shown).toContain('Sensor desconectado · Local');
  });

  it('shows a generic place name when the places cannot be loaded', async () => {
    places.list.mockRejectedValue(new AppError('network', 'Sin conexión'));
    const shown = texts(await openScreen());
    expect(shown).toContain('Fuga sospechosa · Lugar');
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
    expect(texts(tree)).not.toContain('Posible fuga de agua'); // the newest one was the first row
  });

  it('does not delete when the user cancels', async () => {
    const tree = await openScreen();

    await press(tree, byLabel('Eliminar alerta'));
    await press(tree, byButton('No, conservarla'));

    expect(repository.remove).not.toHaveBeenCalled();
    expect(texts(tree)).toContain('Posible fuga de agua');
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

describe('NotificationsScreen — close the valve from a leak alert (HU-029)', () => {
  it('opens the dashboard of that place asking for the close dialog', async () => {
    const navigate = jest.fn();
    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = create(<NotificationsScreen navigation={{ navigate } as never} route={{} as never} />);
    });
    renderers.push(tree);

    await press(tree, byLabel('Cerrar válvula'));

    // the sample leak belongs to place-1, which the fake place list names "Casa"
    expect(navigate).toHaveBeenCalledWith('PlaceDashboard', { placeId: 'place-1', placeName: 'Casa', openCloseValve: true });
  });

  it('shows the close-valve button only on the leak alert', async () => {
    const shown = texts(await openScreen());
    expect(shown.split('Cerrar válvula')).toHaveLength(2); // exactly one occurrence
  });
});
