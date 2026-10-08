import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { AppError } from '../../../domain/common/AppError';
import { PlaceRepository } from '../../../domain/places/PlaceRepository';
import { usePlaceNames } from '../usePlaceNames';

// The hook only needs the repository we pass in, not the real network clients.
jest.mock('../../../core/di/container', () => ({ placeRepository: {} }));
// useFocusEffect runs like a normal effect (the screen is always "focused" in these tests).
jest.mock('@react-navigation/native', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { useFocusEffect: (effect: () => void | (() => void)) => React.useEffect(effect, [effect]) };
});

const renderers: ReactTestRenderer[] = [];

const setup = async (list: jest.Mock) => {
  // Created once: if the repository were created inside Harness, every render would give the hook a new
  // object, its effect would run again, set state again, and loop forever (the real app has a single one).
  const repository = { list } as unknown as PlaceRepository;
  const result = { current: {} as Record<string, string> };
  const Harness = () => {
    result.current = usePlaceNames(repository);
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

describe('usePlaceNames', () => {
  it('gives the name of each place by its id', async () => {
    const list = jest.fn().mockResolvedValue([
      { id: 'p1', name: 'Casa' },
      { id: 'p2', name: 'Local' },
    ]);

    const result = await setup(list);

    expect(result.current).toEqual({ p1: 'Casa', p2: 'Local' });
  });

  it('stays empty, without failing, when the places cannot be loaded', async () => {
    const result = await setup(jest.fn().mockRejectedValue(new AppError('network', 'Sin conexión')));

    expect(result.current).toEqual({});
  });
});
