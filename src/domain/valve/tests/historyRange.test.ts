import { describeFilter, parseDateInput, resolveHistoryRange } from '../historyRange';

const NOW = new Date(2026, 9, 8, 15, 30); // 8 Oct 2026, local time

const range = (result: ReturnType<typeof resolveHistoryRange>) => {
  if (!result.ok) throw new Error(result.message);
  return { from: new Date(result.range.from), to: new Date(result.range.to) };
};

describe('parseDateInput', () => {
  it('reads yyyy-mm-dd and dd/mm/yyyy as local days', () => {
    expect(parseDateInput('2026-10-01')).toEqual(new Date(2026, 9, 1));
    expect(parseDateInput(' 1/10/2026 ')).toEqual(new Date(2026, 9, 1));
  });

  it('rejects text and days that do not exist', () => {
    expect(parseDateInput('')).toBeNull();
    expect(parseDateInput('ayer')).toBeNull();
    expect(parseDateInput('2026-02-30')).toBeNull();
    expect(parseDateInput('31/04/2026')).toBeNull();
  });
});

describe('resolveHistoryRange', () => {
  it('"Hoy" goes from midnight until now', () => {
    const { from, to } = range(resolveHistoryRange({ preset: 'TODAY', from: '', to: '' }, NOW));
    expect(from).toEqual(new Date(2026, 9, 8));
    expect(to).toEqual(NOW);
  });

  it('"7 días" and "30 días" include today', () => {
    expect(range(resolveHistoryRange({ preset: 'WEEK', from: '', to: '' }, NOW)).from).toEqual(new Date(2026, 9, 2));
    expect(range(resolveHistoryRange({ preset: 'MONTH', from: '', to: '' }, NOW)).from).toEqual(new Date(2026, 8, 9));
  });

  it('a custom range covers the whole last day', () => {
    const { from, to } = range(resolveHistoryRange({ preset: 'CUSTOM', from: '2026-10-01', to: '2026-10-05' }, NOW));
    expect(from).toEqual(new Date(2026, 9, 1));
    expect(to).toEqual(new Date(2026, 9, 5, 23, 59, 59, 999));
  });

  it('one single day is a valid custom range', () => {
    expect(resolveHistoryRange({ preset: 'CUSTOM', from: '2026-10-05', to: '2026-10-05' }, NOW).ok).toBe(true);
  });

  it('explains what is wrong with a custom range', () => {
    const message = (from: string, to: string) => {
      const result = resolveHistoryRange({ preset: 'CUSTOM', from, to }, NOW);
      return result.ok ? null : result.message;
    };
    expect(message('', '2026-10-05')).toMatch(/inicial y la final/);
    expect(message('hola', '2026-10-05')).toMatch(/AAAA-MM-DD/);
    expect(message('2026-10-06', '2026-10-05')).toMatch(/no puede ser posterior/);
    expect(message('2024-01-01', '2026-10-05')).toMatch(/máximo es de un año/);
  });
});

describe('describeFilter', () => {
  it('names each period', () => {
    expect(describeFilter({ preset: 'TODAY', from: '', to: '' })).toBe('Hoy');
    expect(describeFilter({ preset: 'WEEK', from: '', to: '' })).toBe('Últimos 7 días');
    expect(describeFilter({ preset: 'MONTH', from: '', to: '' })).toBe('Últimos 30 días');
    expect(describeFilter({ preset: 'CUSTOM', from: '2026-10-01', to: '2026-10-05' })).toMatch(/^Del .*1.* al .*5/);
  });
});
