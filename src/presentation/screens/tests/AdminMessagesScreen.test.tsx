import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { AdminMessagesScreen } from '../admin/AdminMessagesScreen';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

let mockRoles: string[] = ['ADMIN'];
jest.mock('../../../core/auth/AuthContext', () => ({ useAuth: () => ({ user: { roles: mockRoles } }) }));

const mockList = jest.fn();
const mockSave = jest.fn();
const mockReset = jest.fn();
const mockTest = jest.fn();
const mockProviders = jest.fn();
jest.mock('../../../core/di/container', () => ({
  messageTemplateRepository: {
    list: (...args: unknown[]) => mockList(...args),
    save: (...args: unknown[]) => mockSave(...args),
    reset: (...args: unknown[]) => mockReset(...args),
    test: (...args: unknown[]) => mockTest(...args),
    providers: (...args: unknown[]) => mockProviders(...args),
  },
}));

const alert = {
  key: 'ALERT_CRITICAL',
  body: '{app} - ALERTA: {title} en {place}. Abre la app para revisarla.',
  defaultBody: '{app} - ALERTA: {title} en {place}. Abre la app para revisarla.',
  isCustom: false,
  placeholders: [
    { name: 'app', token: '{app}', required: false },
    { name: 'title', token: '{title}', required: false },
    { name: 'place', token: '{place}', required: false },
  ],
  maxLength: 320,
  updatedAt: null,
};

const texts = (tree: ReactTestRenderer) =>
  tree.root
    .findAll((n) => (n.type as unknown) === 'Text')
    .map((n) => n.children.filter((c) => typeof c === 'string').join(''))
    .join(' | ');

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

const render = async () => {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = create(<AdminMessagesScreen {...({} as React.ComponentProps<typeof AdminMessagesScreen>)} />);
  });
  await flush();
  return tree;
};

const field = (tree: ReactTestRenderer) =>
  tree.root.find((n) => n.props.multiline === true && typeof n.props.onChangeText === 'function');
const button = (tree: ReactTestRenderer, label: string) =>
  tree.root.find((n) => n.props.label === label && typeof n.props.onPress === 'function');

describe('AdminMessagesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRoles = ['ADMIN'];
    mockList.mockResolvedValue([alert]);
    mockProviders.mockResolvedValue({ sms: 'mailpit', whatsApp: 'meta', whatsAppTemplate: false });
  });

  it('shows each text with a preview filled with example data', async () => {
    const tree = await render();

    const shown = texts(tree);
    expect(shown).toContain('Alerta crítica');
    expect(shown).toContain('Cuida Tu Agua - ALERTA: Válvula cerrada en Casa centro. Abre la app para revisarla.');
    expect(shown).toContain('{place}');
  }, 20_000);

  it('saves a new text and shows what the server answered', async () => {
    mockSave.mockResolvedValue({ ...alert, body: 'URGENTE {place}: {title}', isCustom: true });
    const tree = await render();

    act(() => field(tree).props.onChangeText('URGENTE {place}: {title}'));
    expect(texts(tree)).toContain('URGENTE Casa centro: Válvula cerrada');
    await act(async () => {
      button(tree, 'Guardar texto').props.onPress();
    });
    await flush();

    expect(mockSave).toHaveBeenCalledWith('ALERT_CRITICAL', 'URGENTE {place}: {title}');
    expect(texts(tree)).toContain('Personalizado');
    expect(texts(tree)).toContain('el próximo mensaje ya sale así');
  });

  it('a placeholder of another message is explained and cannot be saved', async () => {
    const tree = await render();

    act(() => field(tree).props.onChangeText('Alerta {code}'));

    expect(field(tree).props.error).toMatch(/no es un dato de este mensaje/);
    expect(button(tree, 'Guardar texto').props.disabled).toBe(true);
  });

  it('says whether WhatsApp is real (Meta) or simulated', async () => {
    const tree = await render();

    expect(texts(tree)).toContain('WhatsApp sale por Meta');
    expect(texts(tree)).toContain('SMS se simula en Mailpit');
  });

  it('sends a test to the phone of the administrator and shows the answer of the provider', async () => {
    mockTest.mockResolvedValueOnce({ sent: true, channel: 'WHATSAPP', maskedPhone: '+57300***233', providerMessageId: 'wamid.1', problem: null, detail: null, body: 'x' });
    const tree = await render();

    await act(async () => {
      button(tree, 'Enviarme una prueba').props.onPress();
    });
    await flush();
    expect(mockTest).toHaveBeenCalledWith('ALERT_CRITICAL');
    expect(texts(tree)).toContain('Prueba enviada por WhatsApp a +57300***233');

    mockTest.mockResolvedValueOnce({ sent: false, channel: 'WHATSAPP', maskedPhone: '+57300***233', providerMessageId: null, problem: 'rejected', detail: 'Meta 400 (131030): Recipient phone number not in allowed list', body: 'x' });
    await act(async () => {
      button(tree, 'Enviarme una prueba').props.onPress();
    });
    await flush();
    expect(texts(tree)).toContain('El proveedor rechazó el mensaje. Detalle: Meta 400 (131030)');
  });

  it('a person who is not an administrator does not see the texts', async () => {
    mockRoles = ['USER'];
    const tree = await render();

    expect(mockList).not.toHaveBeenCalled();
    expect(texts(tree)).not.toContain('Alerta crítica');
  });
});
