import { Valve, ValveCommand } from '../Valve';
import { availability, describeRequester, isFinished, outcomeMessage } from '../valveRules';

const command = (overrides: Partial<ValveCommand> = {}): ValveCommand => ({
  id: 'c1',
  action: 'CLOSE',
  status: 'SENT',
  origin: 'MANUAL',
  requestedBy: 'u1',
  requestedByName: 'Juan Ome',
  createdAt: '2026-10-03T15:00:00Z',
  sentAt: '2026-10-03T15:00:00Z',
  timeoutAt: '2026-10-03T15:00:30Z',
  acknowledgedAt: null,
  failureReason: null,
  ...overrides,
});

const valve = (overrides: Partial<Valve> = {}): Valve => ({
  placeId: 'p1',
  state: 'OPEN',
  communication: 'OK',
  lastConfirmedAt: '2026-10-03T15:00:00Z',
  pendingCommand: null,
  ...overrides,
});

describe('valveRules', () => {
  it('an open valve can only be closed, a closed one only opened', () => {
    expect(availability(valve())).toEqual({ canClose: true, canOpen: false, reason: null });
    expect(availability(valve({ state: 'CLOSED' }))).toMatchObject({ canClose: false, canOpen: true });
    expect(availability(valve({ state: 'UNKNOWN' }))).toMatchObject({ canClose: true, canOpen: true });
  });

  it('an order in progress blocks both buttons', () => {
    expect(availability(valve({ pendingCommand: command() }))).toMatchObject({ canClose: false, canOpen: false });
  });

  it('without communication only opening is possible (closing would waste the e-mailed code)', () => {
    const result = availability(valve({ state: 'CLOSED', communication: 'NO_COMMUNICATION' }));
    expect(result).toMatchObject({ canClose: false, canOpen: true });
    expect(result.reason).toMatch(/Sin comunicación/);
  });

  it('only SENT is unfinished', () => {
    expect(isFinished(command())).toBe(false);
    expect(isFinished(command({ status: 'ACK_TIMEOUT' }))).toBe(true);
  });

  it('explains each outcome', () => {
    expect(outcomeMessage(command({ status: 'ACK_SUCCESS' }))).toEqual({
      tone: 'success',
      text: 'El medidor confirmó: la válvula se cerró.',
    });
    expect(outcomeMessage(command({ status: 'ACK_TIMEOUT' })).tone).toBe('error');
    expect(outcomeMessage(command({ status: 'FAILED', action: 'OPEN' })).text).toMatch(/sigue como estaba/);
  });

  it('names who gave the order', () => {
    expect(describeRequester(command())).toBe('Juan Ome');
    expect(describeRequester(command({ origin: 'AUTO_LEAK', requestedByName: null }))).toMatch(/fuga/);
  });
});
