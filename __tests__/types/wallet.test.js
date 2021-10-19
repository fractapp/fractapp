
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
