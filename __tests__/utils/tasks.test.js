import {Currency} from 'types/wallet';
import tasks from 'utils/tasks';
import DB from 'storage/DB';
import {TxStatus, TxType} from 'types/transaction';
import {Network} from 'types/account';
import ChatsStore from 'storage/Chats';
import {Adaptors} from 'adaptors/adaptor';
import BN from 'bn.js';
import AccountsStore from 'storage/Accounts';
import math from 'utils/math';
import { useContext } from 'react';
import PricesStore from 'storage/Prices';
import GlobalStore from 'storage/Global';
import BackendApi from 'utils/backend';
import { ChatType } from 'types/chatInfo';

global.fetch = jest.fn();
jest.mock('react-native-background-timer', () => ({
  runBackgroundTimer: jest.fn(),
  setInterval: jest.fn(),
}));
jest.mock('adaptors/adaptor', () => ({
  Adaptors: {
    init: jest.fn(),
    get: jest.fn(),
  },
}));
jest.mock('utils/backend', () => ({
  getUserById: jest.fn(),
  getJWT: jest.fn(),
  getTransactions: jest.fn(),
  getTxStatus: jest.fn(),
  getInfo: jest.fn(),
}));
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
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
  useState: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
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

it('Test createTask', async () => {
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
    state: new Map([[Currency.DOT, 5]]),
  };

  const globalContext = {

  };

  const chatsContext = {
    transactions: new Map(),
  };
  chatsContext.transactions.set(Currency.DOT, {
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

  expect(tasks.createTask(accountsContext, pricesContext, globalContext, chatsContext)).toEqual({'_U': 0, '_V': 0, '_W': null, '_X': null});
});

it('Test setTx with null users', async () => {
  const globalContext = {

  };
  const isNotify = true;
  const chatsContext = {
    transactions: new Map(),
  };
  chatsContext.transactions.set(Currency.DOT, {
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

  const tx = {
    id: 'idOne',
    hash: 'hash',
    userId: 'id',
    address: 'address',
    currency: Currency.DOT,
    txType: TxType.None,
    timestamp: new Date('12-12-2020').getTime(),

    value: 10,
    planckValue: '1000',
    usdValue: 10,

    fee: 10,
    planckFee: '15',
    usdFee: 10,

    status: TxStatus.Pending,
  };
  expect(tasks.setTx(globalContext, chatsContext, tx, isNotify)).toEqual({'_U': 0, '_V': 0, '_W': null, '_X': null});
});


it('Test setTx with users', async () => {
  const globalContext = {

  };
  const isNotify = true;
  const chatsContext = {
    transactions: new Map(),
  };
  chatsContext.transactions.set(Currency.DOT, {
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

  const tx = {
    id: 'idOne',
    hash: 'hash',
    userId: 'id',
    address: 'address',
    currency: Currency.DOT,
    txType: TxType.None,
    timestamp: new Date('12-12-2020').getTime(),

    value: 10,
    planckValue: '1000',
    usdValue: 10,

    fee: 10,
    planckFee: '15',
    usdFee: 10,

    status: TxStatus.Pending,
  };
  const users = {
    id: 'idContact',
    name: 'name',
    username: 'username',
    avatarExt: 'jpg',
    lastUpdate: 100,
    addresses: {
      0: 'addressPolkadot',
      1: 'addressKusama',
    },
  };
  BackendApi.getUserById.mockReturnValueOnce(users);
  expect(tasks.setTx(globalContext, chatsContext, tx, isNotify)).toEqual({'_U': 0, '_V': 0, '_W': null, '_X': null});
});

it('Test initPrivateData', async () => {
  BackendApi.getJWT.mockReturnValueOnce('some data');
  expect(tasks.initPrivateData()).toEqual({'_U': 0, '_V': 0, '_W': null, '_X': null});
});

it('Test syncByAccount with existed txs 1', async () => {
  const globalContext = {

  };
  const chatsContext = {
    state: {
      transactions: new Map(),
      sentFromFractapp: new Map(),
    },
  };
  chatsContext.state.transactions.set(Currency.DOT, {
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
  chatsContext.state.sentFromFractapp.set('idOne', true);
  const account = {
    name: 'name',
    address: 'address',
    pubKey: 'pubKey',
    currency: Currency.DOT,
    network: Network.Polkadot,
    balance: 10000,
    planks: '10000000',
  };
  const isSynced = true;
  const tx = [{
    id: 'idOne',
    hash: 'hash',
    userId: 'id',
    address: 'address',
    currency: Currency.DOT,
    txType: TxType.None,
    timestamp: new Date('12-12-2020').getTime(),

    value: 10,
    planckValue: '1000',
    usdValue: 10,

    fee: 10,
    planckFee: '15',
    usdFee: 10,

    status: TxStatus.Pending,
  }];
  BackendApi.getTransactions.mockReturnValueOnce(tx);
  expect(tasks.syncByAccount(account, isSynced, globalContext, chatsContext)).toEqual({'_U': 0, '_V': 0, '_W': null, '_X': null});
});

it('Test syncByAccount with existed txs 2', async () => {
  const globalContext = {

  };
  const chatsContext = {
    state: {
      transactions: new Map(),
      sentFromFractapp: new Map(),
    },
  };
  chatsContext.state.transactions.set(Currency.DOT, {
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
  chatsContext.state.sentFromFractapp.set('idTwo', true);
  const account = {
    name: 'name',
    address: 'address',
    pubKey: 'pubKey',
    currency: Currency.DOT,
    network: Network.Polkadot,
    balance: 10000,
    planks: '10000000',
  };
  const isSynced = true;
  const tx = [{
    id: 'idOne',
    hash: 'hash',
    userId: 'id',
    address: 'address',
    currency: Currency.DOT,
    txType: TxType.None,
    timestamp: new Date('12-12-2020').getTime(),

    value: 10,
    planckValue: '1000',
    usdValue: 10,

    fee: 10,
    planckFee: '15',
    usdFee: 10,

    status: TxStatus.Pending,
  }];
  BackendApi.getTransactions.mockReturnValueOnce(tx);
  expect(tasks.syncByAccount(account, isSynced, globalContext, chatsContext)).toEqual({'_U': 0, '_V': 0, '_W': null, '_X': null});
});

it('Test syncByAccount with existed txs 3', async () => {
  const globalContext = {

  };
  const chatsContext = {
    state: {
      transactions: new Map(),
      sentFromFractapp: new Map(),
    },
  };
  chatsContext.state.transactions.set(Currency.DOT, {
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
  chatsContext.state.sentFromFractapp.set('idTwo', true);
  const account = {
    name: 'name',
    address: 'address',
    pubKey: 'pubKey',
    currency: Currency.DOT,
    network: Network.Polkadot,
    balance: 10000,
    planks: '10000000',
  };
  const isSynced = false;
  const tx = [{
    id: 'idOne',
    hash: 'hash',
    userId: 'id',
    address: 'address',
    currency: Currency.DOT,
    txType: TxType.None,
    timestamp: new Date('12-12-2020').getTime(),

    value: 10,
    planckValue: '1000',
    usdValue: 10,

    fee: 10,
    planckFee: '15',
    usdFee: 10,

    status: TxStatus.Pending,
  }];
  BackendApi.getTransactions.mockReturnValueOnce(tx);
  expect(tasks.syncByAccount(account, isSynced, globalContext, chatsContext)).toEqual({'_U': 0, '_V': 0, '_W': null, '_X': null});
});

it('Test syncByAccount with empty txs', async () => {
  const globalContext = {

  };
  const chatsContext = {
    state: {
      transactions: new Map(),
    },
  };
  chatsContext.state.transactions.set(Currency.DOT, undefined);
  const account = {
    name: 'name',
    address: 'address',
    pubKey: 'pubKey',
    currency: Currency.DOT,
    network: Network.Polkadot,
    balance: 10000,
    planks: '10000000',
  };
  const isSynced = true;
  const tx = [];
  BackendApi.getTransactions.mockReturnValueOnce(tx);
  expect(tasks.syncByAccount(account, isSynced, globalContext, chatsContext)).toEqual({'_U': 0, '_V': 0, '_W': null, '_X': null});
});

it('Test sync', async () => {
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
  const globalContext = {
    state: {
      authInfo: {
        isSynced: false,
      },
    },
    dispatch: jest.fn(),
  };
  const chatsContext = {
    state: {
      transactions: new Map(),
      pendingTransactions: new Map(),
    },
  };
  chatsContext.state.pendingTransactions.set(Currency.DOT, {
    idsOfTransactions: ['idOne', 'idTwo'],
  });
  chatsContext.state.transactions.set(Currency.DOT, {
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
  expect(tasks.sync(accountsContext, globalContext, chatsContext)).toEqual({'_U': 0, '_V': 0, '_W': null, '_X': null});
});

it('Test checkPendingTxs 1', async () => {
  const chatsContext = {
    state: {
      transactions: new Map(),
      pendingTransactions: new Map(),
    },
  };
  chatsContext.state.pendingTransactions.set(Currency.DOT, {
    idsOfTransactions: ['idOne', 'idTwo'],
  });
  chatsContext.state.transactions.set(Currency.DOT, {
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
  BackendApi.getTxStatus.mockReturnValueOnce('hash');
  expect(tasks.checkPendingTxs(chatsContext)).toEqual({'_U': 0, '_V': 0, '_W': null, '_X': null});
});

it('Test checkPendingTxs 2', async () => {
  const chatsContext = {
    state: {
      transactions: new Map(),
      pendingTransactions: new Map(),
    },
  };
  chatsContext.state.pendingTransactions.set(Currency.DOT, {
    idsOfTransactions: ['idOne', 'idTwo'],
  });
  chatsContext.state.transactions.set(Currency.DOT, {
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
  BackendApi.getTxStatus.mockReturnValueOnce(TxStatus.Pending);
  expect(tasks.checkPendingTxs(chatsContext)).toEqual({'_U': 0, '_V': 0, '_W': null, '_X': null});
});

it('Test updateUsersList', async () => {
  const globalContext = {
    state: {
      users: new Map([
        [ 'idOne',
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
          } ],
      ]),
    },
    dispatch: jest.fn(),
  };
  const chatsContext = {
    state: {
      chatsInfo: new Map([
        [ '1',
          {
            id: 'idContact',
            name: 'name',
            lastTxId: 'idOne',
            lastTxCurrency: Currency.DOT,
            timestamp: 5,
            type: ChatType.AddressOnly,
            details: null,
          } ],
      ]),
    },
    dispatch: jest.fn(),
  };
  const user = {
    id: 'idContact',
    name: 'name',
    username: 'username',
    avatarExt: 'jpg',
    lastUpdate: 100,
    addresses: {
      0: 'addressPolkadot',
      1: 'addressKusama',
    },
  };
  BackendApi.getUserById.mockReturnValueOnce(user);
  expect(tasks.updateUsersList(globalContext, chatsContext)).toEqual({'_U': 0, '_V': 0, '_W': null, '_X': null});
});

it('Test updateUsersList with undefined user', async () => {
  const globalContext = {
    state: {
      users: new Map([
        [ 'idOne',
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
          } ],
      ]),
    },
    dispatch: jest.fn(),
  };
  const chatsContext = {
    state: {
      chatsInfo: new Map([
        [ '1',
          {
            id: 'idContact',
            name: 'name',
            lastTxId: 'idOne',
            lastTxCurrency: Currency.DOT,
            timestamp: 5,
            type: ChatType.AddressOnly,
            details: null,
          } ],
      ]),
    },
    dispatch: jest.fn(),
  };
  const user = undefined;
  BackendApi.getUserById.mockReturnValueOnce(user);
  expect(tasks.updateUsersList(globalContext, chatsContext)).toEqual({'_U': 0, '_V': 0, '_W': null, '_X': null});
});

it('Test updateUsersList with null user', async () => {
  const globalContext = {
    state: {
      users: new Map([
        [ 'idOne',
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
          } ],
      ]),
    },
    dispatch: jest.fn(),
  };
  const chatsContext = {
    state: {
      chatsInfo: new Map([
        [ '1',
          {
            id: 'idContact',
            name: 'name',
            lastTxId: 'idOne',
            lastTxCurrency: Currency.DOT,
            timestamp: 5,
            type: ChatType.AddressOnly,
            details: null,
          } ],
      ]),
    },
    dispatch: jest.fn(),
  };
  const user = null;
  BackendApi.getUserById.mockReturnValueOnce(user);
  expect(tasks.updateUsersList(globalContext, chatsContext)).toEqual({'_U': 0, '_V': 0, '_W': null, '_X': null});
});

it('Test updateServerInfo', async () => {
  const globalContext = {
    state: {
      users: new Map([
        [ 'idOne',
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
          } ],
      ]),
    },
    dispatch: jest.fn(),
  };

  const pricesContext = {
    dispatch: jest.fn(),
    updatePrice: jest.fn(),
  };

  const user = null;
  BackendApi.getInfo.mockReturnValueOnce({
    substrateUrls:['url'],
    prices: [15],
  });
  expect(tasks.updateServerInfo(globalContext, pricesContext)).toEqual({'_U': 0, '_V': 0, '_W': null, '_X': null});
});
