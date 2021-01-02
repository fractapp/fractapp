import {getSymbol, getLogo, Wallet, Currency} from 'models/wallet';

test('create model #1', () => {
  const balance = 100;
  const price = 12;
  const model = new Wallet('name', 'address', Currency.Kusama, balance, price);
  expect(model.name).toBe('name');
  expect(model.address).toBe('address');
  expect(model.currency).toBe(Currency.Kusama);
  expect(model.balance).toBe(balance);
  expect(model.usdValue).toBe(balance * price);
});

test('create model #2', () => {
  const balance = 100;
  const price = 12.123123123;
  const model = new Wallet('name', 'address', Currency.Kusama, balance, price);
  expect(model.name).toBe('name');
  expect(model.address).toBe('address');
  expect(model.currency).toBe(Currency.Kusama);
  expect(model.balance).toBe(balance);
  expect(model.usdValue).toBe(+(balance * price).toFixed(2));
});

test('get logo Kusama', () => {
  expect(getLogo(Currency.Kusama)).toBe(require('assets/img/kusama.png'));
});

test('get logo Polkadot', () => {
  expect(getLogo(Currency.Polkadot)).toBe(require('assets/img/dot.png'));
});

test('get logo throw', () => {
  expect(() => getLogo(999)).toThrow('invalid currency');
});

test('get symbol Kusama', () => {
  expect(getSymbol(Currency.Kusama)).toBe('KSM');
});

test('get symbol Polkadot', () => {
  expect(getSymbol(Currency.Polkadot)).toBe('DOT');
});

test('get symbol throw', () => {
  expect(() => getSymbol(999)).toThrow('invalid currency');
});
