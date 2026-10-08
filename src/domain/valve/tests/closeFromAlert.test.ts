import { Valve } from '../Valve';
import { shouldOpenCloseDialog } from '../closeFromAlert';

const valve = (overrides: Partial<Valve> = {}): Valve => ({
  placeId: 'p1',
  state: 'OPEN',
  communication: 'OK',
  lastConfirmedAt: '2026-10-03T15:00:00Z',
  pendingCommand: null,
  ...overrides,
});

describe('shouldOpenCloseDialog', () => {
  it('opens the dialog when asked and the valve is open', () => {
    expect(shouldOpenCloseDialog(true, valve())).toBe(true);
  });

  it('does nothing when the screen was not opened from an alert', () => {
    expect(shouldOpenCloseDialog(undefined, valve())).toBe(false);
    expect(shouldOpenCloseDialog(false, valve())).toBe(false);
  });

  it('waits while the valve has not loaded', () => {
    expect(shouldOpenCloseDialog(true, null)).toBe(false);
  });

  it('does not offer to close a valve that is already closed or unknown', () => {
    expect(shouldOpenCloseDialog(true, valve({ state: 'CLOSED' }))).toBe(false);
    expect(shouldOpenCloseDialog(true, valve({ state: 'UNKNOWN' }))).toBe(false);
  });

  it('does not open a second order while one is waiting', () => {
    const pendingCommand = {
      id: 'c1', action: 'CLOSE', status: 'SENT', origin: 'AUTO_LEAK', requestedBy: null, requestedByName: null,
      createdAt: '2026-10-03T15:00:00Z', sentAt: null, timeoutAt: '2026-10-03T15:01:00Z', acknowledgedAt: null, failureReason: null,
    } as const;
    expect(shouldOpenCloseDialog(true, valve({ pendingCommand }))).toBe(false);
  });
});
