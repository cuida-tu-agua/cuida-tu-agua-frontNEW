import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { ConsumptionBucket } from '../../../domain/consumption/Consumption';
import { ConsumptionChart } from '../consumption/ConsumptionChart';

const texts = (tree: ReactTestRenderer) =>
  tree.root
    .findAll((n) => (n.type as unknown) === 'Text')
    .map((n) => n.children.filter((c) => typeof c === 'string').join(''))
    .join(' | ');

/** Renders the chart and gives it a width, as the phone does after the first layout. */
const render = (element: React.ReactElement) => {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = create(element);
  });
  const withLayout = tree.root.findAll((n) => typeof n.props.onLayout === 'function');
  act(() => withLayout[0].props.onLayout({ nativeEvent: { layout: { width: 240 } } }));
  return tree;
};

// Bars at 08:00, 09:00 and 10:00 of a day, in the local time of the machine (the app labels bars that way)
const bar = (hour: number, liters: number): ConsumptionBucket => ({ start: new Date(2026, 9, 3, hour).toISOString(), liters });
const BUCKETS = [bar(8, 10), bar(9, 12.5), bar(10, 0)];

const touchAreas = (tree: ReactTestRenderer) =>
  tree.root.findAll((n) => n.props.accessibilityRole === 'button' && typeof n.props.onPress === 'function' && typeof n.props.onHoverIn === 'function');

describe('ConsumptionChart — exact value of an interval (HU-017)', () => {
  it('invites the user to tap a bar when nothing is selected', () => {
    const tree = render(<ConsumptionChart buckets={BUCKETS} period="DAY" unit="LITERS" />);
    expect(texts(tree)).toContain('Toca una barra para ver su valor');
  });

  it('has one touch area per bar, each describing its interval for screen readers', () => {
    const tree = render(<ConsumptionChart buckets={BUCKETS} period="DAY" unit="LITERS" />);
    const labels = touchAreas(tree).map((n) => n.props.accessibilityLabel as string);

    expect(labels).toHaveLength(3);
    expect(labels[1]).toMatch(/^09:00 a 10:00 · 12[,.]5 L$/);
  });

  it('shows the exact value of the bar the user taps', () => {
    const tree = render(<ConsumptionChart buckets={BUCKETS} period="DAY" unit="LITERS" />);

    act(() => touchAreas(tree)[1].props.onPress());

    expect(texts(tree)).toMatch(/09:00 a 10:00 · 12[,.]5 L/);
    expect(texts(tree)).not.toContain('Toca una barra');
  });

  it('shows the value when the mouse hovers a bar on the web', () => {
    const tree = render(<ConsumptionChart buckets={BUCKETS} period="DAY" unit="LITERS" />);

    act(() => touchAreas(tree)[0].props.onHoverIn());

    expect(texts(tree)).toMatch(/08:00 a 09:00 · 10 L/);
  });

  it('can show a bar with no consumption', () => {
    const tree = render(<ConsumptionChart buckets={BUCKETS} period="DAY" unit="LITERS" />);

    act(() => touchAreas(tree)[2].props.onPress());

    expect(texts(tree)).toMatch(/10:00 a 11:00 · 0 L/);
  });

  it('tapping the selected bar again clears the selection', () => {
    const tree = render(<ConsumptionChart buckets={BUCKETS} period="DAY" unit="LITERS" />);

    act(() => touchAreas(tree)[1].props.onPress());
    act(() => touchAreas(tree)[1].props.onPress());

    expect(texts(tree)).toContain('Toca una barra para ver su valor');
  });

  it('shows the value in the unit of the place', () => {
    const tree = render(<ConsumptionChart buckets={[bar(8, 2500)]} period="DAY" unit="CUBIC_METERS" />);

    act(() => touchAreas(tree)[0].props.onPress());

    expect(texts(tree)).toMatch(/2[,.]5 m³/);
  });

  it('drops the selection when the period changes and that bar is no longer there', () => {
    const tree = render(<ConsumptionChart buckets={BUCKETS} period="DAY" unit="LITERS" />);
    act(() => touchAreas(tree)[1].props.onPress());

    const week = [0, 1, 2].map((d) => ({ start: new Date(2026, 9, 1 + d).toISOString(), liters: 5 }));
    act(() => tree.update(<ConsumptionChart buckets={week} period="WEEK" unit="LITERS" />));

    expect(texts(tree)).toContain('Toca una barra para ver su valor');
  });
});
