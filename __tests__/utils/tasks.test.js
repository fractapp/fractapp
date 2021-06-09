import {Currency} from 'types/wallet';
import tasks from 'utils/tasks';
import DB from 'storage/DB';
import {TxStatus, TxType} from 'types/transaction';
import {Network} from 'types/account';
import PricesStore from 'storage/Prices';
import ChatsStore from 'storage/Chats';
import { Adaptors } from 'adaptors/adaptor';
import BN from 'bn.js';
import AccountsStore from 'storage/Accounts';
import math from 'utils/math';

global.fetch = jest.fn();
jest.mock('react-native-background-timer', () => ({
  runBackgroundTimer: jest.fn(),
}));
jest.mock('adaptors/adaptor', () => ({
  Adaptors: {
    init: jest.fn(),
    get: jest.fn(),
  },
}));
jest.mock('utils/backend', () => ({}));
jest.mock('storage/DB', () => ({
  getAccounts: jest.fn(),
  getAccountInfo: jest.fn(),
  getTxs: jest.fn(),
  getPrice: jest.fn(),
  getPendingTxs: jest.fn(),
  getChatsInfo: jest.fn(),
  getChatsState: jest.fn(),
  getSubstrateUrls: jest.fn(),
  getChat: jest.fn(),
  getAuthInfo: jest.fn(),
  getNotificationCount: jest.fn(),
  getProfile: jest.fn(),
  getContacts: jest.fn(),
  getUsers: jest.fn(),
  getLang: jest.fn(),
}));

it('Test init', async () => {
  const globalContext = {
    dispatch: jest.fn(),
  };
  const accountsContext = {
    dispatch: jest.fn(),
  };
  const pricesContext = {
    dispatch: jest.fn(),
  };
  const chatsContext = {
    dispatch: jest.fn(),
  };
  const transactionsContext = {
    dispatch: jest.fn(),
  };

  const price = 123123;
  DB.getPrice.mockReturnValueOnce(price);

  const chatsState = ChatsStore.initialState();
  chatsState.transactions.set(Currency.DOT, {
    transactionById: new Map([
      [ 'idOne',
        {
          id: 'idOne',
          userId: 'userId',
          address: 'address#1',
          currency: Currency.DOT,
          txType: TxType.None,
          timestamp: new Date('12-12-2020').getTime(),
          value: 10,
          usdValue: 10,
          fee: 10,
          usdFee: 10,
          status: TxStatus.Success,
        } ],
      [
        'idTwo',
        {
          id: 'idTwo',
          userId: 'userId',
          address: 'address#1',
          currency: Currency.DOT,
          txType: TxType.None,
          timestamp: new Date('12-12-2020').getTime(),
          value: 10,
          usdValue: 10,
          fee: 10,
          usdFee: 10,
          status: TxStatus.Pending,
        },
      ],
    ]),
  });
  DB.getChatsState.mockReturnValueOnce(chatsState);

  const account = {
    name: 'name',
    address: 'address',
    pubKey: 'pubKey',
    currency: Currency.DOT,
    network: Network.Polkadot,
    balance: 10000,
    planks: '10000000',
  };
  DB.getAccountInfo.mockReturnValueOnce(account);
  DB.getAccounts.mockReturnValueOnce([account.address]);

  const myProfile = {
    id: 'idProfile',
    name: 'name',
    username: 'username',
    phoneNumber: 'phoneNumber',
    email: 'email',
    isMigratory: false,
    avatarExt: 'png',
    lastUpdate: 123123,
  };
  DB.getProfile.mockReturnValueOnce(myProfile);

  const contacts = [
    {
      id: 'idContact',
      name: 'name',
      username: 'username',
      avatarExt: 'jpg',
      lastUpdate: 100,
      addresses: {
        0: 'addressPolkadot',
        1: 'addressKusama',
      },
    },
  ];
  DB.getContacts.mockReturnValueOnce(contacts);

  const users = new Map([
    [
      'idContact',
      {
        id: 'idContact',
        name: 'name',
        username: 'username',
        avatarExt: 'jpg',
        lastUpdate: 100,
        addresses: {
          0: 'addressPolkadot',
          1: 'addressKusama',
        },
      },
    ],
  ]);
  DB.getUsers.mockReturnValueOnce(users);

  await tasks.init(
    globalContext,
    accountsContext,
    pricesContext,
    chatsContext,
    transactionsContext,
  );

  expect(DB.getAccounts).toBeCalledWith();
  expect(DB.getAccountInfo).toBeCalledWith(account.address);
  expect(DB.getPrice).toBeCalledWith(account.currency);
  expect(DB.getChatsState).toBeCalled();
  expect(DB.getAuthInfo).toBeCalled();
  expect(DB.getProfile).toBeCalled();
  expect(DB.getContacts).toBeCalled();
  expect(DB.getUsers).toBeCalled();
  expect(DB.getSubstrateUrls).toBeCalled();
  expect(DB.getLang).toBeCalled();
});

it('Test updateBalances', async () => {
  const accountsContext = {
    state: {
      accounts: new Map([
        [
          Currency.DOT,
          {
            name: 'name',
            address: 'address',
            pubKey: 'pubKey',
            currency: Currency.DOT,
            network: Network.Polkadot,
            balance: 10000,
            planks: '10000000',
          },
        ],
      ]),
      isInitialized: true,
    },
    dispatch: jest.fn(),
  };
  const pricesContext = {
    state: new Map(),
    dispatch: jest.fn(),
  };

  const ApiMock = {
    balance: jest.fn(),
    decimals: 10,
    viewDecimals: 4,
  };
  await Adaptors.get.mockReturnValueOnce(ApiMock);
  const plankBalance = new BN('123450000000');
  const viewBalance = math.convertFromPlanckToViewDecimals(
    plankBalance,
    10,
    4,
  );

  ApiMock.balance.mockReturnValueOnce(plankBalance);

  const price = 123123;
  fetch.mockReturnValueOnce({
    ok: true,
    json: jest.fn(() => ({
      price: price,
    })),
  });

  await tasks.updateBalances(pricesContext, accountsContext);

  const account =  accountsContext.state.accounts.get(Currency.DOT);
  expect(ApiMock.balance).toBeCalledWith(accountsContext.state.accounts.get(Currency.DOT).address);
  expect(accountsContext.dispatch).toBeCalledWith(
    AccountsStore.updateBalance(
      account.currency,
      viewBalance,
      plankBalance.toString(),
    ),
  );
});
