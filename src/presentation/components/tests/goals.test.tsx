import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { GoalProgress } from '../../../domain/goals/Goal';
import { GoalCard } from '../goals/GoalCard';
import { GoalDialog } from '../goals/GoalDialog';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

const texts = (tree: ReactTestRenderer) =>
  tree.root
    .findAll((n) => (n.type as unknown) === 'Text')
    .map((n) => n.children.filter((c) => typeof c === 'string').join(''))
    .join(' | ');

const goal = (over: Partial<GoalProgress> = {}): GoalProgress => ({
  placeId: 'p1',
  timeZone: 'America/Bogota',
  monthStart: '2026-10-01',
  daysInMonth: 31,
  daysLeft: 12,
  consumedLiters: 7600,
  hasGoal: true,
  targetLiters: 9500,
  percentage: 80,
  remainingLiters: 1900,
  status: 'WARNING',
  updatedAt: '2026-10-20T15:40:57Z',
  ...over,
});

const noop = () => undefined;

const render = (element: React.ReactElement) => {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = create(element);
  });
  return tree;
};

describe('GoalCard', () => {
  it('without a goal invites to create one and says how much was used', () => {
    const tree = render(
      <GoalCard
        goal={goal({ hasGoal: false, targetLiters: null, percentage: null, remainingLiters: null, status: null })}
        loading={false}
        error={null}
        unit="CUBIC_METERS"
        onEdit={noop}
      />,
    );
    const shown = texts(tree);
    expect(shown).toContain('Aún no tienes una meta para octubre');
    expect(shown).toContain('7,6 m³');
    expect(tree.root.findAll((n) => n.props.label === 'Definir meta' && !!n.props.onPress)).not.toHaveLength(0);
    expect(tree.root.findAll((n) => n.props.accessibilityRole === 'progressbar')).toHaveLength(0);
  });

  it('with a goal shows used of goal, the percentage, the days left and the state', () => {
    const tree = render(<GoalCard goal={goal()} loading={false} error={null} unit="LITERS" onEdit={noop} />);
    const shown = texts(tree);
    expect(shown).toContain('Meta de octubre');
    expect(shown).toContain('Cerca de la meta');
    expect(shown).toContain('80 %');
    expect(shown).toContain('Quedan 12 días del mes');
    expect(shown).toContain('Te quedan 1.900 L');
    const bar = tree.root.find((n) => n.props.accessibilityRole === 'progressbar');
    expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 80 });
  });

  it('an exceeded goal says by how much and the bar stays full', () => {
    const tree = render(
      <GoalCard
        goal={goal({ consumedLiters: 11000, percentage: 115.7, remainingLiters: 0, status: 'EXCEEDED' })}
        loading={false}
        error={null}
        unit="LITERS"
        onEdit={noop}
      />,
    );
    expect(texts(tree)).toContain('Meta superada');
    expect(texts(tree)).toContain('Te pasaste por 1.500 L');
    expect(texts(tree)).toContain('115,7 %');
    expect(tree.root.find((n) => n.props.accessibilityRole === 'progressbar').props.accessibilityValue.now).toBe(100);
  });
});

describe('GoalDialog', () => {
  const input = (tree: ReactTestRenderer) => tree.root.find((n) => n.props.keyboardType === 'numeric' && !!n.props.onChangeText);

  it('starts from the current goal in the unit of the place and sends liters', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const onDone = jest.fn();
    const tree = render(
      <GoalDialog visible goal={goal({ targetLiters: 12500 })} unit="CUBIC_METERS" save={save} onDone={onDone} onCancel={noop} />,
    );

    expect(input(tree).props.value).toBe('12,5');
    act(() => input(tree).props.onChangeText('10'));
    await act(async () => {
      await input(tree).props.onSubmitEditing();
    });

    expect(save).toHaveBeenCalledWith(10000);
    expect(onDone).toHaveBeenCalled();
  });

  it('an invalid value is explained next to the field and nothing is sent', async () => {
    const save = jest.fn();
    const tree = render(<GoalDialog visible goal={goal()} unit="LITERS" save={save} onDone={noop} onCancel={noop} />);

    act(() => input(tree).props.onChangeText('0'));
    await act(async () => {
      await input(tree).props.onSubmitEditing();
    });

    expect(save).not.toHaveBeenCalled();
    expect(input(tree).props.error).toMatch(/mayor que cero/);
  });

  it('a reload of the goal while typing does not erase what was typed', () => {
    const tree = render(<GoalDialog visible goal={goal()} unit="LITERS" save={jest.fn()} onDone={noop} onCancel={noop} />);
    act(() => input(tree).props.onChangeText('8000'));
    act(() => {
      tree.update(<GoalDialog visible goal={goal({ consumedLiters: 7700 })} unit="LITERS" save={jest.fn()} onDone={noop} onCancel={noop} />);
    });
    expect(input(tree).props.value).toBe('8000');
  });
});
