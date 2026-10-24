import React from 'react';
import { Linking } from 'react-native';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { GuestLinkCard } from '../sharing/GuestLinkCard';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('../../../core/di/container', () => ({ messageTemplateRepository: {} }));

const link = { id: 'l1', placeId: 'p1', token: 'AbC123', url: 'https://app.cuidatuagua/guest/AbC123', createdAt: '2026-10-24T00:00:00Z' };

const render = (shared: jest.Mock) => {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = create(
      <GuestLinkCard
        link={link}
        loading={false}
        create={jest.fn()}
        deactivate={jest.fn()}
        placeName="Casa centro"
        ownerName="Ana Gómez"
        messages={{ list: jest.fn(), save: jest.fn(), reset: jest.fn(), shared }}
      />,
    );
  });
  return tree;
};

const whatsAppButton = (tree: ReactTestRenderer) =>
  tree.root.find((n) => n.props.label === 'Enviar por WhatsApp' && typeof n.props.onPress === 'function');

describe('GuestLinkCard · send by WhatsApp', () => {
  let open: jest.SpyInstance;

  beforeEach(() => {
    open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });

  afterEach(() => open.mockRestore());

  it('opens WhatsApp with the text the administrator wrote, filled with the place, the owner and the link', async () => {
    const shared = jest.fn().mockResolvedValue({ key: 'GUEST_LINK_SHARE', body: '{owner} te comparte {place}: {link}' });
    const tree = render(shared);

    await act(async () => {
      await whatsAppButton(tree).props.onPress();
    });

    expect(shared).toHaveBeenCalledWith('GUEST_LINK_SHARE');
    expect(open).toHaveBeenCalledWith(
      `https://wa.me/?text=${encodeURIComponent('Ana Gómez te comparte Casa centro: https://app.cuidatuagua/guest/AbC123')}`,
    );
  });

  it('without the text of the server it still sends the usual message with the link', async () => {
    const tree = render(jest.fn().mockRejectedValue(new Error('offline')));

    await act(async () => {
      await whatsAppButton(tree).props.onPress();
    });

    expect(decodeURIComponent(open.mock.calls[0][0])).toContain('https://app.cuidatuagua/guest/AbC123');
  });
});
