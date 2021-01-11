import db from 'storage/DB';
import * as polkadot from 'utils/polkadot';
import tasks from 'utils/tasks';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/Prices';
import {Currency} from 'models/wallet';
import {Account} from 'models/account';

global.fetch = jest.fn();

jest.mock('utils/db', () => ({
  getAccounts: jest.fn(),
  getAccountInfo: jest.fn(),
  setAccountInfo: jest.fn(),
}));
jest.mock('react-native-background-timer', () => ({
  runBackgroundTimer: jest.fn(),
}));
jest.mock('utils/polkadot', () => ({
  Api: {
    getInstance: () => ({
      balance: jest.fn(),
    }),
  },
}));

it('Test create task', async () => {
  const accountDispatch = jest.fn();
  const pricesDispatch = jest.fn();

  const address = 'address';
  const account = new Account('name', address, '0x0', Currency.Polkadot, 0);

  db.getAccounts.mockReturnValueOnce([address]);
  db.getAccountInfo.mockReturnValueOnce(account);

  const currency = Currency.Polkadot;
  const api = polkadot.Api.getInstance(currency);
  const balance = 100;
  const price = 200;
  api.balance.mockReturnValue(balance);

  fetch.mockReturnValue({
    ok: true,
    json: () => ({
      price: price,
    }),
  });

  await tasks.createTask(accountDispatch, pricesDispatch);

  expect(accountDispatch).toBeCalledWith({
    type: AccountsStore.Action.ADD_ACCOUNT,
    account: account,
  });

  account.balance = balance;
  expect(db.setAccountInfo).toBeCalledWith(account);
  expect(pricesDispatch).toBeCalledWith({
    type: PricesStore.Action.UPDATE_PRICE,
    price: price,
    currency: currency,
  });
});

it('Test create task throw', async () => {
  const accountDispatch = jest.fn();
  const priceDispatch = jest.fn();

  db.getAccounts.mockReturnValueOnce(null);

  fetch.mockReturnValue({
    ok: true,
    json: () => ({
      price: 100,
    }),
  });

  expect(tasks.createTask(accountDispatch, priceDispatch)).rejects.toThrow(
    'accounts not found',
  );
});
