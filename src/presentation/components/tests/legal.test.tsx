import React from 'react';
import { Modal } from 'react-native';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { changeLanguage } from '../../../i18n';
import { GoogleConsentNote, LegalLinks } from '../legal';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));

const render = (element: React.ReactElement) => {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = create(element);
  });
  return tree;
};

const press = (tree: ReactTestRenderer, label: string) =>
  act(() => {
    tree.root.find((n) => n.props.accessibilityRole === 'link' && n.props.children === label).props.onPress({ stopPropagation: jest.fn() });
  });

const modal = (tree: ReactTestRenderer) => tree.root.findByType(Modal);

/** Every text drawn inside the open window. */
const textOf = (tree: ReactTestRenderer) => {
  const found: string[] = [];
  const visit = (node: unknown) => {
    if (typeof node === 'string') found.push(node);
    else if (Array.isArray(node)) node.forEach(visit); // a component that returns a fragment
    else if (node && typeof node === 'object') ((node as { children?: unknown[] }).children ?? []).forEach(visit);
  };
  visit(tree.toJSON());
  return found.join(' ');
};

describe('legal links and window', () => {
  it('opens the terms from the links under the forms and closes with "Entendido"', () => {
    const tree = render(<LegalLinks />);
    expect(modal(tree).props.visible).toBe(false);

    press(tree, 'Términos');

    expect(modal(tree).props.visible).toBe(true);
    expect(textOf(tree)).toContain('Términos y Condiciones');
    expect(textOf(tree)).toContain('No es un medidor oficial.');

    act(() => {
      tree.root.find((n) => n.props.label === 'Entendido' && typeof n.props.onPress === 'function').props.onPress();
    });
    expect(modal(tree).props.visible).toBe(false);
  });

  it('the line under the Google button opens the data policy', () => {
    const tree = render(<GoogleConsentNote />);

    press(tree, 'Política de Tratamiento de Datos');

    expect(modal(tree).props.visible).toBe(true);
    expect(textOf(tree)).toContain('Política de Tratamiento de Datos Personales');
    expect(textOf(tree)).toContain('Tu consumo de agua es un dato personal:');
  });

  it('a link does not let the press reach the box of the terms around it', () => {
    const tree = render(<LegalLinks />);
    const stopPropagation = jest.fn();

    act(() => {
      tree.root.find((n) => n.props.accessibilityRole === 'link' && n.props.children === 'Privacidad').props.onPress({ stopPropagation });
    });

    expect(stopPropagation).toHaveBeenCalled();
  });

  it('shows the documents in the language of the app', async () => {
    await act(async () => void (await changeLanguage('en')));
    const tree = render(<LegalLinks />);

    press(tree, 'Privacy');

    expect(textOf(tree)).toContain('Personal Data Processing Policy');
    expect(textOf(tree)).toContain('In force since October 26, 2026');
    act(() => tree.unmount());
  });
});
