import {
  getSymbol,
  getLogo,
  Currency,
  getName,
  getColor,
  withoutBorder,
  toCurrency,
} from 'types/wallet';

import {getSymbol, getLogo, Currency} from 'types/wallet';

test('get logo Kusama', () => {
  expect(getLogo(Currency.KSM)).toBe(require('assets/img/kusama.png'));
});

test('get logo Polkadot', () => {
  expect(getLogo(Currency.DOT)).toBe(require('assets/img/dot.png'));
});

test('get logo throw', () => {
  expect(() => getLogo(999)).toThrow('invalid currency');
});

test('get symbol Kusama', () => {
  expect(getSymbol(Currency.KSM)).toBe('KSM');
});

test('get symbol Polkadot', () => {
  expect(getSymbol(Currency.DOT)).toBe('DOT');
});

test('get symbol throw', () => {
  expect(() => getSymbol(999)).toThrow('invalid currency');
});

test('get name Polkadot', () => {
  expect(getName(Currency.DOT)).toBe('Polkadot');
});
test('get name Kusama', () => {
  expect(getName(Currency.KSM)).toBe('Kusama');
});
test('get name throw', () => {
  expect(() => getName(999)).toThrow('invalid currency');
});

test('get color Polkadot', () => {
  expect(getColor(Currency.DOT)).toBe('#E6007A');
});
test('get color Kusama', () => {
  expect(getColor(Currency.KSM)).toBe('#888888');
});
test('get color throw', () => {
  expect(() => getColor(999)).toThrow('invalid currency');
});

test('withoutBorder DOT', () => {
  expect(withoutBorder(Currency.DOT)).toBe(true);
});
test('withoutBorder KSM', () => {
  expect(withoutBorder(Currency.KSM)).toBe(true);
});

test('toCurrency DOT', () => {
  expect(toCurrency('DOT')).toBe(Currency.DOT);
});

test('toCurrency KSM', () => {
  expect(toCurrency('KSM')).toBe(Currency.KSM);
});

test('toCurrency throw', () => {
  expect(() => toCurrency('asd')).toThrow('invalid currency');
});
