import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { AppError } from '../../../domain/common/AppError';
import { es } from '../../../i18n/locales/es';
import { GuestScreen } from '../guest/GuestScreen';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('../../../core/auth/AuthContext', () => ({ useAuth: () => ({ status: 'signedOut' }) }));

const mockGetPlace = jest.fn();
const mockGetConsumption = jest.fn();
jest.mock('../../../core/di/container', () => ({
  guestRepository: {
    getPlace: (...args: unknown[]) => mockGetPlace(...args),
    getConsumption: (...args: unknown[]) => mockGetConsumption(...args),
  },
}));

const texts = (tree: ReactTestRenderer) =>
  tree.root
    .findAll((n) => (n.type as unknown) === 'Text')
    .map((n) => n.children.filter((c) => typeof c === 'string').join(''))
    .join(' | ');

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

const render = async () => {
  let tree!: ReactTestRenderer;
  act(() => {
    const props = { route: { params: { token: 'tok' } } } as unknown as React.ComponentProps<typeof GuestScreen>;
    tree = create(<GuestScreen {...props} />);
  });
  await flush();
  return tree;
};

const consumption = {
  placeId: 'p',
  period: 'DAY',
  timeZone: 'America/Bogota',
  from: '',
  to: '',
  totalLiters: 1500,
  hasData: true,
  buckets: [],
  lastReadingAt: null,
  currentFlowLpm: null,
  generatedAt: '',
};

describe('GuestScreen (HU-040)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it('shows the name of the place, the read-only notice and the consumption of the link', async () => {
    mockGetPlace.mockResolvedValue({ name: 'Casa de Ana', cityName: 'Cali', measurementUnit: 'LITERS' });
    mockGetConsumption.mockResolvedValue(consumption);

    const tree = await render();

    expect(mockGetPlace).toHaveBeenCalledWith('tok');
    expect(mockGetConsumption).toHaveBeenCalledWith('tok', 'DAY', expect.any(String));
    expect(texts(tree)).toContain('Casa de Ana');
    expect(texts(tree)).toContain(es.guest.readOnly);
    act(() => tree.unmount());
  });

  it('says the link no longer works when the server answers 404', async () => {
    mockGetPlace.mockRejectedValue(new AppError('not_found', 'nope'));
    mockGetConsumption.mockRejectedValue(new AppError('not_found', 'nope'));

    const tree = await render();

    expect(texts(tree)).toContain(es.guest.unavailableTitle);
    expect(texts(tree)).not.toContain('Casa de Ana');
    act(() => tree.unmount());
  });
});
