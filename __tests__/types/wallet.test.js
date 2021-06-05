import { Network } from 'types/account';
import {getSymbol, getLogo, Wallet, Currency} from 'types/wallet';

test('create model #1', () => {
  const balance = 100;
  const price = 12;
  const model = new Wallet(
    'name',
    'address',
    Currency.KSM,
    Network.Kusama,
    balance,
    '10000',
    price,
  );
  expect(model.name).toBe('name');
  expect(model.address).toBe('address');
  expect(model.currency).toBe(Currency.KSM);
  expect(model.balance).toBe(balance);
  expect(model.usdValue).toBe(balance * price);
});

test('create model #2', () => {
  const balance = 100;
  const price = 12.123123123;
  const model = new Wallet(
    'name',
    'address',
    Currency.KSM,
    Network.Kusama,
    balance,
    '1000',
    price,
  );
  expect(model.name).toBe('name');
  expect(model.address).toBe('address');
  expect(model.currency).toBe(Currency.KSM);
  expect(model.balance).toBe(balance);
  expect(model.usdValue).toBe(+(balance * price).toFixed(2));
});

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
