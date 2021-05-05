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
    Accounts.updateBalance(Currency.KSM, 1000, '1000000000000000'),
  ).toStrictEqual({
    type: Accounts.Action.UPDATE_BALANCE,
    balance: 1000,
    currency: Currency.KSM,
    planks: '1000000000000000',
  });
});

it('Test set', async () => {
  const account = {
    name: 'name',
    address: 'address',
    pubKey: 'pubkey',
    currency: Currency.DOT,
    balance: 1000,
    planks: '10000',
  };
  const accounts = new Map([[Currency.DOT, account]]);
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
    currency: Currency.KSM,
    balance: 1000,
    planks: '10000',
  };
  const accounts = new Map([[Currency.KSM, account]]);
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
    currency: Currency.KSM,
    balance: 1000,
    planks: '10000',
  };
  const accounts = new Map([[Currency.KSM, account]]);
  const add = Accounts.set(accounts);
  const prevState = Accounts.reducer(initState(), add);

  const updBalance = Accounts.updateBalance(
    Currency.KSM,
    2000,
    '2000000000000000',
  );

  expect(initState()).toStrictEqual({
    accounts: new Map(),
    isInitialized: false,
  });
  const expectAccounts = new Map([
    [
      Currency.KSM,
      {
        name: 'name',
        address: 'address',
        pubKey: 'pubkey',
        currency: Currency.KSM,
        balance: 2000,
        planks: '2000000000000000',
      },
    ],
  ]);
  expect(Accounts.reducer(prevState, updBalance)).toStrictEqual({
    isInitialized: true,
    accounts: expectAccounts,
  });
  expect(DB.setAccountInfo).toBeCalledWith(expectAccounts.get(Currency.KSM));
});

it('Test default', async () => {
  expect(
    Accounts.reducer(Accounts.initialState(), {
      type: 9999,
    }),
  ).toStrictEqual(initState());
});
