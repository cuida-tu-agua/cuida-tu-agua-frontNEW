import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { CostEstimate } from '../../../domain/tariffs/Tariff';
import { Valve } from '../../../domain/valve/Valve';
import { es } from '../../../i18n/locales/es';
import { PermissionPicker } from '../sharing/PermissionPicker';
import { CostCard } from '../tariffs/CostCard';
import { ValveCard } from '../valve/ValveCard';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

const render = (element: React.ReactElement) => {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = create(element);
  });
  return tree;
};

const texts = (tree: ReactTestRenderer) =>
  tree.root
    .findAll((n) => (n.type as unknown) === 'Text')
    .map((n) => n.children.filter((c) => typeof c === 'string').join(''))
    .join(' | ');

const noop = () => undefined;

/** The checkboxes, once each: the renderer also lists the wrappers that pass the same props down. */
const checkboxes = (tree: ReactTestRenderer) => {
  const all = tree.root.findAll((n) => n.props.accessibilityRole === 'checkbox' && typeof n.props.onPress === 'function');
  return all.filter((n) => !(n.parent && all.includes(n.parent)));
};

const valve: Valve = {
  placeId: 'p1',
  state: 'OPEN',
  communication: 'OK',
  lastConfirmedAt: new Date().toISOString(),
  pendingCommand: null,
};

describe('PermissionPicker (HU-042/046)', () => {
  it('lists the five permissions with their hints', () => {
    const tree = render(<PermissionPicker value={['VIEW_CONSUMPTION']} onChange={noop} />);
    const shown = texts(tree);

    Object.values(es.sharing.permissions).forEach((permission) => {
      expect(shown).toContain(permission.label);
      expect(shown).toContain(permission.hint);
    });
  });

  it('shows VIEW_CONSUMPTION as checked even when the value does not list it, and the others as chosen', () => {
    const tree = render(<PermissionPicker value={['CONTROL_VALVE']} onChange={noop} />);
    const boxes = checkboxes(tree);

    expect(boxes.map((b) => b.props.accessibilityState.checked)).toEqual([true, false, true, false, false]);
  });

  it('choosing a permission reports the new selection, always with VIEW_CONSUMPTION', () => {
    const onChange = jest.fn();
    const tree = render(<PermissionPicker value={['VIEW_CONSUMPTION']} onChange={onChange} />);
    const boxes = checkboxes(tree);

    act(() => boxes[4].props.onPress());

    expect(onChange).toHaveBeenCalledWith(['VIEW_CONSUMPTION', 'VIEW_BILLS']);
  });

  it('touching VIEW_CONSUMPTION changes nothing', () => {
    const onChange = jest.fn();
    const tree = render(<PermissionPicker value={['VIEW_CONSUMPTION', 'VIEW_BILLS']} onChange={onChange} />);
    const boxes = checkboxes(tree);

    act(() => boxes[0].props.onPress());

    expect(onChange).toHaveBeenCalledWith(['VIEW_CONSUMPTION', 'VIEW_BILLS']);
  });
});

describe('ValveCard for a collaborator (HU-044)', () => {
  it('with permission to operate it shows both buttons', () => {
    const tree = render(<ValveCard valve={valve} command={null} onClose={noop} onOpen={noop} onDismissCommand={noop} onHistory={noop} />);

    expect(texts(tree)).toContain(es.valve.card.close);
    expect(texts(tree)).toContain(es.valve.card.open);
  });

  it('read only shows the state and the history but neither close nor open', () => {
    const tree = render(<ValveCard valve={valve} command={null} readOnly onClose={noop} onOpen={noop} onDismissCommand={noop} onHistory={noop} />);

    expect(texts(tree)).toContain('Abierta');
    expect(texts(tree)).toContain(es.valve.card.history);
    expect(texts(tree)).not.toContain(es.valve.card.close);
    expect(texts(tree)).not.toContain(es.valve.card.open);
  });
});

describe('CostCard for a collaborator (HU-044)', () => {
  const noTariff = { period: 'DAY', hasTariff: false, catalogAvailable: true } as unknown as CostEstimate;

  it('the owner is invited to configure the tariff', () => {
    const tree = render(<CostCard period="DAY" cost={noTariff} loading={false} error={null} onConfigure={noop} />);

    expect(texts(tree)).toContain(es.cost.configure);
  });

  it('a collaborator is told the owner has not set it, with no button to change it', () => {
    const tree = render(<CostCard period="DAY" cost={noTariff} loading={false} error={null} />);

    expect(texts(tree)).toContain(es.cost.noTariffShared);
    expect(texts(tree)).not.toContain(es.cost.configure);
  });
});
