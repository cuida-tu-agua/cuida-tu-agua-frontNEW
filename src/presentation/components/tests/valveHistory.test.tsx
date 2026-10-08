import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { ValveCommand } from '../../../domain/valve/Valve';
import { ValveHistoryFilter } from '../valve/ValveHistoryFilter';
import { ValveHistoryItem } from '../valve/ValveHistoryItem';

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

const command = (overrides: Partial<ValveCommand> = {}): ValveCommand => ({
  id: 'c1',
  action: 'CLOSE',
  status: 'ACK_SUCCESS',
  origin: 'MANUAL',
  requestedBy: 'u1',
  requestedByName: 'Juan Ome',
  createdAt: '2026-10-03T15:00:00Z',
  sentAt: null,
  timeoutAt: '2026-10-03T15:00:30Z',
  acknowledgedAt: null,
  failureReason: null,
  ...overrides,
});

describe('ValveHistoryItem (HU-022)', () => {
  it('shows action, user and "Manual" for an order given by a person', () => {
    const out = texts(render(<ValveHistoryItem command={command()} />));
    expect(out).toContain('Cerrar agua');
    expect(out).toContain('Juan Ome · Manual');
    expect(out).toContain('Confirmada');
  });

  it('shows "Automático" for the closing made by a leak', () => {
    const out = texts(render(<ValveHistoryItem command={command({ origin: 'AUTO_LEAK', requestedByName: null })} />));
    expect(out).toContain('Automático (posible fuga) · Automático');
  });

  it('keeps the failure note', () => {
    const out = texts(render(<ValveHistoryItem command={command({ action: 'OPEN', status: 'ACK_TIMEOUT', failureReason: 'x' })} />));
    expect(out).toContain('Abrir agua');
    expect(out).toContain('El medidor no respondió a tiempo.');
  });
});

describe('ValveHistoryFilter (HU-022)', () => {
  const props = (overrides = {}) => ({
    preset: 'MONTH' as const,
    from: '',
    to: '',
    error: null,
    onPresetChange: jest.fn(),
    onFromChange: jest.fn(),
    onToChange: jest.fn(),
    onApply: jest.fn(),
    ...overrides,
  });

  it('offers the four periods and reports the one chosen', () => {
    const p = props();
    const tree = render(<ValveHistoryFilter {...p} />);
    const out = texts(tree);
    ['Hoy', '7 días', '30 días', 'Rango'].forEach((label) => expect(out).toContain(label));

    const radios = tree.root.findAll((n) => n.props.accessibilityRole === 'radio' && typeof n.props.onPress === 'function');
    act(() => radios[0].props.onPress());
    expect(p.onPresetChange).toHaveBeenCalledWith('TODAY');
  });

  it('shows the date fields only for a custom range', () => {
    expect(texts(render(<ValveHistoryFilter {...props()} />))).not.toContain('Desde');
    expect(texts(render(<ValveHistoryFilter {...props({ preset: 'CUSTOM' })} />))).toContain('Desde');
  });

  it('shows the validation error and applies on press', () => {
    const p = props({ preset: 'CUSTOM', error: 'Usa el formato AAAA-MM-DD, por ejemplo 2026-10-01.' });
    const tree = render(<ValveHistoryFilter {...p} />);
    expect(texts(tree)).toContain('Usa el formato AAAA-MM-DD');

    const apply = tree.root.findAll((n) => n.props.label === 'Aplicar' && typeof n.props.onPress === 'function');
    act(() => apply[0].props.onPress());
    expect(p.onApply).toHaveBeenCalled();
  });
});
