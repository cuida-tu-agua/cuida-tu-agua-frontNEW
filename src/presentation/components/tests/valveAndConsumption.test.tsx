import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { Consumption } from '../../../domain/consumption/Consumption';
import { AppError } from '../../../domain/common/AppError';
import { Valve, ValveCommand } from '../../../domain/valve/Valve';
import { ConsumptionCard } from '../consumption/ConsumptionCard';
import { CloseValveDialog } from '../valve/CloseValveDialog';
import { ValveCard } from '../valve/ValveCard';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

const texts = (tree: ReactTestRenderer) =>
  tree.root
    .findAll((n) => (n.type as unknown) === 'Text')
    .map((n) => n.children.filter((c) => typeof c === 'string').join(''))
    .join(' | ');

const valve: Valve = {
  placeId: 'p1',
  state: 'OPEN',
  communication: 'OK',
  lastConfirmedAt: new Date().toISOString(),
  pendingCommand: null,
};

const command: ValveCommand = {
  id: 'c1', action: 'CLOSE', status: 'SENT', origin: 'MANUAL', requestedBy: 'u1', requestedByName: 'Juan',
  createdAt: '', sentAt: '', timeoutAt: '', acknowledgedAt: null, failureReason: null,
};

const noop = () => undefined;

describe('ValveCard', () => {
  it('shows the confirmed state and the waiting message of an order', () => {
    let tree!: ReactTestRenderer;
    act(() => {
      tree = create(
        <ValveCard valve={valve} command={command} onClose={noop} onOpen={noop} onDismissCommand={noop} onHistory={noop} />,
      );
    });
    expect(texts(tree)).toContain('Abierta');
    expect(texts(tree)).toContain('esperando que el medidor confirme');
  });

  it('shows the timeout result', () => {
    let tree!: ReactTestRenderer;
    act(() => {
      tree = create(
        <ValveCard
          valve={{ ...valve, communication: 'NO_COMMUNICATION' }}
          command={{ ...command, status: 'ACK_TIMEOUT' }}
          onClose={noop}
          onOpen={noop}
          onDismissCommand={noop}
          onHistory={noop}
        />,
      );
    });
    expect(texts(tree)).toContain('no respondió en 30 segundos');
    expect(texts(tree)).toContain('Sin comunicación');
  });
});

describe('ConsumptionCard', () => {
  const data: Consumption = {
    placeId: 'p1', period: 'DAY', timeZone: 'America/Bogota', from: '', to: '', totalLiters: 1234.5, hasData: true,
    buckets: Array.from({ length: 24 }, (_, h) => ({ start: new Date(2026, 9, 3, h).toISOString(), liters: h === 7 ? 80 : 2 })),
    lastReadingAt: new Date().toISOString(), currentFlowLpm: 3.2, generatedAt: '',
  };

  it('shows total, flow now and the chart', () => {
    let tree!: ReactTestRenderer;
    act(() => {
      tree = create(<ConsumptionCard period="DAY" onPeriodChange={noop} data={data} loading={false} error={null} unit="LITERS" />);
    });
    const shown = texts(tree);
    expect(shown).toMatch(/1[.,]235 L|1[.,]234[.,]5 L/);
    expect(shown).toMatch(/Ahora: 3[,.]2 L\/min/);
  });

  it('does not show the data of another period', () => {
    let tree!: ReactTestRenderer;
    act(() => {
      tree = create(
        <ConsumptionCard period="WEEK" onPeriodChange={noop} data={data} loading={false} error={new AppError('network', 'x')} unit="LITERS" />,
      );
    });
    expect(texts(tree)).toContain('Sin datos');
  });
});

describe('CloseValveDialog', () => {
  it('asks for the code, then sends it; a wrong code stays in the dialog', async () => {
    const requestCode = jest.fn().mockResolvedValue({ maskedEmail: 'j***@mail.com', expiresAt: '' });
    const confirm = jest
      .fn()
      .mockRejectedValueOnce(new AppError('validation', 'El código no es correcto.', { code: 'El código no es correcto. Te quedan 4 intentos.' }))
      .mockResolvedValueOnce({});
    const onDone = jest.fn();

    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = create(
        <CloseValveDialog visible placeName="Casa" requestCode={requestCode} confirm={confirm} onDone={onDone} onCancel={noop} />,
      );
    });
    expect(texts(tree)).toContain('¿Cerrar el agua?');

    const pressButton = async (label: string) => {
      const button = tree.root.find((n) => n.props.label === label && typeof n.props.onPress === 'function');
      await act(async () => button.props.onPress());
    };

    await pressButton('Enviarme el código');
    expect(texts(tree)).toContain('j***@mail.com');

    const codeInput = tree.root.find((n) => typeof n.props.onComplete === 'function');
    await act(async () => codeInput.props.onComplete('000000'));
    expect(texts(tree)).toContain('Te quedan 4 intentos');
    expect(onDone).not.toHaveBeenCalled();

    await act(async () => codeInput.props.onComplete('123456'));
    expect(confirm).toHaveBeenLastCalledWith('123456');
    expect(onDone).toHaveBeenCalled();
  });
});
