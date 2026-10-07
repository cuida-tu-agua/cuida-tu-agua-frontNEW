import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { Alert } from '../../../domain/alerts/Alert';
import { AlertListItem } from '../alerts/AlertListItem';
import { NotificationBell } from '../alerts/NotificationBell';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

const texts = (tree: ReactTestRenderer) =>
  tree.root
    .findAll((n) => (n.type as unknown) === 'Text')
    .map((n) => n.children.filter((c) => typeof c === 'string').join(''))
    .join(' | ');

const render = (element: React.ReactElement) => {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = create(element);
  });
  return tree;
};

const press = (tree: ReactTestRenderer, accessibilityLabel: string) => {
  const target = tree.root.findAll((n) => n.props.accessibilityLabel === accessibilityLabel && !!n.props.onPress);
  act(() => target[0].props.onPress());
};

const alert = (overrides: Partial<Alert> = {}): Alert => ({
  id: 'a1',
  placeId: 'p1',
  placeName: 'Casa',
  type: 'LEAK_SUSPECTED',
  severity: 'CRITICAL',
  message: 'Agua corriendo sin parar',
  createdAt: '2026-10-03T15:00:00Z',
  read: false,
  ...overrides,
});

const noop = () => undefined;

describe('NotificationBell', () => {
  it('shows the number of unread alerts', () => {
    const tree = render(<NotificationBell unreadCount={3} onPress={noop} />);
    expect(texts(tree)).toBe('3');
  });

  it('shows no badge when there is nothing unread', () => {
    const tree = render(<NotificationBell unreadCount={0} onPress={noop} />);
    expect(texts(tree)).toBe('');
  });

  it('shows 99+ when there are too many', () => {
    const tree = render(<NotificationBell unreadCount={250} onPress={noop} />);
    expect(texts(tree)).toBe('99+');
  });

  it('tells screen readers how many are unread', () => {
    const tree = render(<NotificationBell unreadCount={2} onPress={noop} />);
    expect(tree.root.findAll((n) => n.props.accessibilityLabel === 'Notificaciones, 2 sin leer').length).toBeGreaterThan(0);
  });

  it('opens the notification center when pressed', () => {
    const onPress = jest.fn();
    const tree = render(<NotificationBell unreadCount={1} onPress={onPress} />);

    press(tree, 'Notificaciones, 1 sin leer');

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('AlertListItem', () => {
  it('shows the kind, the message, the place and the date of the alert', () => {
    const tree = render(<AlertListItem alert={alert()} onMarkAsRead={noop} onDelete={noop} />);
    const shown = texts(tree);

    expect(shown).toContain('Fuga sospechosa');
    expect(shown).toContain('Agua corriendo sin parar');
    expect(shown).toContain('Casa');
  });

  it('offers to mark an unread alert as read', () => {
    const onMarkAsRead = jest.fn();
    const tree = render(<AlertListItem alert={alert()} onMarkAsRead={onMarkAsRead} onDelete={noop} />);

    press(tree, 'Marcar como leída');

    expect(onMarkAsRead).toHaveBeenCalledTimes(1);
  });

  it('does not offer it when the alert is already read', () => {
    const tree = render(<AlertListItem alert={alert({ read: true })} onMarkAsRead={noop} onDelete={noop} />);
    expect(texts(tree)).not.toContain('Marcar como leída');
  });

  it('lets the user delete the alert', () => {
    const onDelete = jest.fn();
    const tree = render(<AlertListItem alert={alert({ read: true })} onMarkAsRead={noop} onDelete={onDelete} />);

    press(tree, 'Eliminar alerta');

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
