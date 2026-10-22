import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { User } from '../../../domain/entities/User';
import { AppError } from '../../../domain/common/AppError';
import { PhoneVerificationDialog } from '../profile/PhoneVerificationDialog';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

const user = (over: Partial<User> = {}): User => ({
  id: 'u1',
  firstName: 'Juan',
  lastName: 'Ome',
  email: 'juan@mail.com',
  phone: '3001112233',
  phoneVerified: false,
  phoneChannel: null,
  avatarUrl: null,
  emailVerified: true,
  roles: ['USER'],
  createdAt: '2026-09-01T00:00:00Z',
  ...over,
});

const texts = (tree: ReactTestRenderer) =>
  tree.root
    .findAll((n) => (n.type as unknown) === 'Text')
    .map((n) => n.children.filter((c) => typeof c === 'string').join(''))
    .join(' | ');

const noop = () => undefined;

const render = (element: React.ReactElement) => {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = create(element);
  });
  return tree;
};

const segments = (tree: ReactTestRenderer) =>
  tree.root.findAll((n) => Array.isArray(n.props.options) && typeof n.props.onChange === 'function' && !!n.props.label);
const phoneInput = (tree: ReactTestRenderer) =>
  tree.root.find((n) => n.props.keyboardType === 'phone-pad' && typeof n.props.onChangeText === 'function');
const dialog = (tree: ReactTestRenderer) => tree.root.find((n) => typeof n.props.onConfirm === 'function' && !!n.props.title);

describe('PhoneVerificationDialog (HU-028)', () => {
  it('sends the code by the chosen mode and the confirmed profile comes back', async () => {
    const requestCode = jest.fn().mockResolvedValue({ maskedPhone: '+59399***233', channel: 'SMS', expiresAt: '2026-10-22T15:05:00Z' });
    const verified = user({ phone: '+593991112233', phoneVerified: true, phoneChannel: 'SMS' });
    const confirm = jest.fn().mockResolvedValue(verified);
    const onDone = jest.fn();
    const tree = render(<PhoneVerificationDialog visible user={user()} requestCode={requestCode} confirm={confirm} onDone={onDone} onCancel={noop} />);

    expect(texts(tree)).toContain('las alertas críticas');   // the written notice of the chosen mode
    const [country, mode] = segments(tree);
    act(() => country.props.onChange('EC'));
    act(() => phoneInput(tree).props.onChangeText('099 111 2233'));
    act(() => segments(tree)[1].props.onChange('SMS'));
    expect(mode).toBeTruthy();
    await act(async () => {
      await dialog(tree).props.onConfirm();
    });

    expect(requestCode).toHaveBeenCalledWith('EC', '991112233', 'SMS');
    expect(texts(tree)).toContain('+59399***233');

    await act(async () => {
      await tree.root.find((n) => typeof n.props.onComplete === 'function').props.onComplete('123456');
    });
    expect(confirm).toHaveBeenCalledWith('123456');
    expect(onDone).toHaveBeenCalledWith(verified);
  }, 20_000);

  it('a number that is not a mobile of the country is explained and nothing is sent', async () => {
    const requestCode = jest.fn();
    const tree = render(<PhoneVerificationDialog visible user={user({ phone: null })} requestCode={requestCode} confirm={jest.fn()} onDone={noop} onCancel={noop} />);

    act(() => phoneInput(tree).props.onChangeText('6011112233'));
    await act(async () => {
      await dialog(tree).props.onConfirm();
    });

    expect(requestCode).not.toHaveBeenCalled();
    expect(phoneInput(tree).props.error).toMatch(/10 dígitos/);
  });

  it('a number the provider refuses for that mode stays on the first step with the reason under the number', async () => {
    const refused = new AppError('validation', 'No pudimos enviar el código', { phone: 'No pudimos enviar el código a ese número por ese medio.' }, { code: 'phone.not_reachable' });
    const requestCode = jest.fn().mockRejectedValue(refused);
    const tree = render(<PhoneVerificationDialog visible user={user()} requestCode={requestCode} confirm={jest.fn()} onDone={noop} onCancel={noop} />);

    await act(async () => {
      await dialog(tree).props.onConfirm();
    });

    expect(requestCode).toHaveBeenCalledWith('CO', '3001112233', 'WHATSAPP');   // WhatsApp is the default mode
    expect(phoneInput(tree).props.error).toMatch(/ese medio/);
  });
});
