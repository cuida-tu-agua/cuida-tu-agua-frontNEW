import { formatCatalogDate, formatMoney, parseMoneyInput, sourceLabel, validateManualTariff } from '../Tariff';

describe('formatMoney', () => {
  it('pesos have no cents and a dot every three digits', () => {
    expect(formatMoney(162800, 'COP')).toBe('$ 162.800');
    expect(formatMoney(1234567.4, 'COP')).toBe('$ 1.234.567');
    expect(formatMoney(0, 'COP')).toBe('$ 0');
    expect(formatMoney(999, 'COP')).toBe('$ 999');
  });

  it('dollars keep two decimals with a comma', () => {
    expect(formatMoney(12.5, 'USD')).toBe('US$ 12,50');
    expect(formatMoney(1250, 'USD')).toBe('US$ 1.250,00');
  });

  it('a negative amount shows the sign before the symbol', () => {
    expect(formatMoney(-5000, 'COP')).toBe('-$ 5.000');
  });
});

describe('parseMoneyInput: how people write a price', () => {
  it.each([
    ['5234', 5234],
    ['5.234', 5234],            // a dot followed by exactly 3 digits groups thousands, like the bill
    ['1.234.567', 1234567],
    ['5234,5', 5234.5],         // a comma is the decimal mark
    ['5.234,50', 5234.5],
    ['5234.5', 5234.5],         // a dot with 1-2 digits is a decimal mark
    ['5234.57', 5234.57],
    ['$ 5.234', 5234],
    ['  12 000 ', 12000],
  ])('%s -> %s', (text, expected) => {
    expect(parseMoneyInput(text)).toBe(expected);
  });

  it.each(['', 'abc', '12a', '1.2.3', '5,2,1', '--5'])('"%s" is not a number', (text) => {
    expect(parseMoneyInput(text)).toBeNull();
  });
});

describe('validateManualTariff (HU-054)', () => {
  it('the price is required and the fixed charge is optional', () => {
    expect(validateManualTariff({ price: '', fixedCharge: '' }).errors.price).toMatch(/Escribe/);

    const ok = validateManualTariff({ price: '5.234', fixedCharge: '' });
    expect(ok.errors).toEqual({});
    expect(ok.value).toEqual({ unitPricePerM3: 5234, fixedMonthlyCharge: null });
  });

  it('sends both numbers when the user typed both', () => {
    expect(validateManualTariff({ price: '5234,5', fixedCharge: '12.000' }).value).toEqual({
      unitPricePerM3: 5234.5,
      fixedMonthlyCharge: 12000,
    });
  });

  it('a fixed charge of zero is allowed', () => {
    expect(validateManualTariff({ price: '100', fixedCharge: '0' }).value?.fixedMonthlyCharge).toBe(0);
  });

  it('rejects zero, text and absurd prices with a message under the field', () => {
    expect(validateManualTariff({ price: '0', fixedCharge: '' }).errors.price).toMatch(/mayor que cero/);
    expect(validateManualTariff({ price: 'mucho', fixedCharge: '' }).errors.price).toMatch(/solo números/);
    expect(validateManualTariff({ price: '1.000.001', fixedCharge: '' }).errors.price).toMatch(/demasiado alto/);
    expect(validateManualTariff({ price: '100', fixedCharge: 'x' }).errors.fixedCharge).toMatch(/solo números/);
    expect(validateManualTariff({ price: '100', fixedCharge: '10.000.001' }).errors.fixedCharge).toMatch(/demasiado alto/);
  });

  it('with an error there is no value to send', () => {
    expect(validateManualTariff({ price: '0', fixedCharge: '' }).value).toBeNull();
  });
});

describe('where the tariff comes from (HU-069)', () => {
  it('says it in words', () => {
    expect(sourceLabel('MANUAL', null)).toBe('Ingresada por ti');
    expect(sourceLabel('CATALOG', 3)).toBe('Precargada para tu ciudad · estrato 3');
  });

  it('writes the date of the last update', () => {
    expect(formatCatalogDate('2026-01-01')).toBe('1 de enero de 2026');
    expect(formatCatalogDate('2026-10-09')).toBe('9 de octubre de 2026');
    expect(formatCatalogDate('no es fecha')).toBe('no es fecha');
  });
});
