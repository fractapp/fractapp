import {Currency} from 'types/wallet';
import Accounts from 'storage/Accounts';
import DB from 'storage/DB';

jest.mock('storage/DB', () => ({
  setAccountInfo: jest.fn(),
}));
const initState = () => ({
  accounts: new Map(),
  isInitialized: false,
});
it('Test updateBalance', async () => {
  expect(
    Accounts.updateBalance(Currency.Kusama, 1000, '1000000000000000'),
  ).toStrictEqual({
    type: Accounts.Action.UPDATE_BALANCE,
    balance: 1000,
    currency: Currency.Kusama,
    planks: '1000000000000000',
  });
});

it('Test set', async () => {
  const account = {
    name: 'name',
    address: 'address',
    pubKey: 'pubkey',
    currency: Currency.Polkadot,
    balance: 1000,
    planks: '10000',
  };
  const accounts = new Map([[Currency.Polkadot, account]]);
  const result = Accounts.set(accounts);
  expect(result).toStrictEqual({
    type: Accounts.Action.SET,
    accounts: accounts,
  });
});

it('Test reducer set', async () => {
  const account = {
    name: 'name',
    address: 'address',
    pubKey: 'pubkey',
    currency: Currency.Kusama,
    balance: 1000,
    planks: '10000',
  };
  const accounts = new Map([[Currency.Kusama, account]]);
  const add = Accounts.set(accounts);

  expect(initState()).toStrictEqual({
    accounts: new Map(),
    isInitialized: false,
  });
  expect(Accounts.reducer(initState(), add)).toStrictEqual({
    isInitialized: true,
    accounts: add.accounts,
  });
});

it('Test reducer update balance', async () => {
  const account = {
    name: 'name',
    address: 'address',
    pubKey: 'pubkey',
    currency: Currency.Kusama,
    balance: 1000,
    planks: '10000',
  };
  const accounts = new Map([[Currency.Kusama, account]]);
  const add = Accounts.set(accounts);
  const prevState = Accounts.reducer(initState(), add);

  const updBalance = Accounts.updateBalance(
    Currency.Kusama,
    2000,
    '2000000000000000',
  );

  expect(initState()).toStrictEqual({
    accounts: new Map(),
    isInitialized: false,
  });
  const expectAccounts = new Map([
    [
      Currency.Kusama,
      {
        name: 'name',
        address: 'address',
        pubKey: 'pubkey',
        currency: Currency.Kusama,
        balance: 2000,
        planks: '2000000000000000',
      },
    ],
  ]);
  expect(Accounts.reducer(prevState, updBalance)).toStrictEqual({
    isInitialized: true,
    accounts: expectAccounts,
  });
  expect(DB.setAccountInfo).toBeCalledWith(expectAccounts.get(Currency.Kusama));
});

it('Test default', async () => {
  expect(
    Accounts.reducer(Accounts.initialState(), {
      type: 9999,
    }),
  ).toStrictEqual(initState());
});
