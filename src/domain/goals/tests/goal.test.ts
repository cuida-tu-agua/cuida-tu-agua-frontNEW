import {
  daysLeftLabel,
  goalInputValue,
  GoalProgress,
  MAX_GOAL_LITERS,
  monthName,
  overLiters,
  parseVolumeInput,
  progressFraction,
  validateGoalInput,
} from '../Goal';

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

describe('parseVolumeInput', () => {
  it.each([
    ['12', 12],
    ['12,5', 12.5],
    ['12.5', 12.5],
    ['0.75', 0.75],
    ['0.750', 0.75],          // a leading 0 is never a thousands group
    ['12.000', 12000],        // thousands as on the bill
    ['1.234.567', 1234567],
    ['1.234,5', 1234.5],
    [' 9 500 ', 9500],
  ])('"%s" is %d', (text, value) => {
    expect(parseVolumeInput(text)).toBe(value);
  });

  it.each(['', 'abc', '12.5.3', '-3', '12.', '1,2,3'])('"%s" is not a number', (text) => {
    expect(parseVolumeInput(text)).toBeNull();
  });
});

describe('validateGoalInput', () => {
  it('converts what the user typed in the unit of the place to liters', () => {
    expect(validateGoalInput('12', 'CUBIC_METERS')).toEqual({ error: null, liters: 12000 });
    expect(validateGoalInput('9.500', 'LITERS')).toEqual({ error: null, liters: 9500 });
    expect(validateGoalInput('100', 'GALLONS').liters).toBeCloseTo(378.541, 3);
  });

  it('explains every invalid value', () => {
    expect(validateGoalInput('  ', 'LITERS').error).toMatch(/Escribe cuánta agua/);
    expect(validateGoalInput('doce', 'LITERS').error).toMatch(/solo números/);
    expect(validateGoalInput('0', 'LITERS').error).toMatch(/mayor que cero/);
    expect(validateGoalInput('10001', 'CUBIC_METERS').error).toMatch(/demasiado alta/);
    expect(validateGoalInput(String(MAX_GOAL_LITERS), 'LITERS').error).toBeNull();
  });

  it('shows the saved goal again in the unit of the place', () => {
    expect(goalInputValue(12000, 'CUBIC_METERS')).toBe('12');
    expect(goalInputValue(12500, 'CUBIC_METERS')).toBe('12,5');
    expect(goalInputValue(9500, 'LITERS')).toBe('9500');
    // what is shown is what is saved again
    expect(validateGoalInput(goalInputValue(12500, 'CUBIC_METERS'), 'CUBIC_METERS').liters).toBe(12500);
  });
});

describe('goal texts and bar', () => {
  it('names the month from the text (no time zone shift)', () => {
    expect(monthName('2026-10-01')).toBe('octubre');
    expect(monthName('2027-01-01')).toBe('enero');
  });

  it('counts the days left in words', () => {
    expect(daysLeftLabel(1)).toBe('Queda 1 día del mes');
    expect(daysLeftLabel(12)).toBe('Quedan 12 días del mes');
  });

  it('fills the bar up to 100 % and says by how much it was exceeded', () => {
    expect(progressFraction(null)).toBe(0);
    expect(progressFraction(80)).toBe(0.8);
    expect(progressFraction(125)).toBe(1);
    expect(overLiters(goal())).toBe(0);
    expect(overLiters(goal({ consumedLiters: 11000, status: 'EXCEEDED' }))).toBe(1500);
    expect(overLiters(goal({ hasGoal: false, targetLiters: null }))).toBe(0);
  });
});
