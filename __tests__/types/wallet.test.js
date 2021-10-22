import {
  getSymbol,
  getLogo,
  Currency,
  getFullCurrencyName,
  getColor,
  withoutBorder,
  toCurrency, getNetwork, fromCurrency, filterTxsByAccountType,
} from 'types/wallet';
import { AccountType, Network } from 'types/account';
import { TxAction, TxStatus, TxType } from 'types/transaction';


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
  expect(getFullCurrencyName(Currency.DOT)).toBe('Polkadot');
});
test('get name Kusama', () => {
  expect(getFullCurrencyName(Currency.KSM)).toBe('Kusama');
});
test('get name throw', () => {
  expect(() => getFullCurrencyName(999)).toThrow('invalid currency');
});

test('get color Polkadot', () => {
  expect(getColor(Currency.DOT)).toBe('#E6007A');
});
test('get color Kusama', () => {
  expect(getColor(Currency.KSM)).toBe('#434C74');
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

test('get network', () => {
  expect(getNetwork(Currency.DOT)).toBe(Network.Polkadot);
  expect(getNetwork(Currency.KSM)).toBe(Network.Kusama);
  expect(getNetwork(999)).toBe(Network.Polkadot);
});

test('get fromCurrency', () => {
  expect(fromCurrency(Currency.DOT)).toBe('DOT');
  expect(fromCurrency(Currency.KSM)).toBe('KSM');
  expect(() => fromCurrency(999)).toThrow('invalid currency');
});

test('filterTxsByAccountType', () => {
  const txs = [];
  for (let i = 0; i < 10; i++) {
    txs.push({
      id: i,
      action: i,
    });
  }
  expect(filterTxsByAccountType(txs, AccountType.Main)).toMatchSnapshot();
  expect(filterTxsByAccountType(txs, AccountType.Staking)).toMatchSnapshot();
  expect(() => filterTxsByAccountType(txs, 999)).toThrow('invalid action type');
});

