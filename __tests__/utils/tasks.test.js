import {Currency} from 'types/wallet';
import tasks from 'utils/tasks';
import DB from 'storage/DB';
import {TxStatus, TxType} from 'types/transaction';
import {ChatType} from 'types/chatInfo';
import {Account} from 'types/account';
import PricesStore from 'storage/Prices';

global.fetch = jest.fn();
jest.mock('@react-native-firebase/messaging', () => {});
jest.mock('react-native-background-timer', () => ({
  runBackgroundTimer: jest.fn(),
}));
jest.mock('adaptors/adaptor', () => ({}));
jest.mock('utils/backend', () => ({}));
jest.mock('storage/DB', () => ({
  getAccounts: jest.fn(),
  getAccountInfo: jest.fn(),
  getTxs: jest.fn(),
  getPrice: jest.fn(),
  getPendingTxs: jest.fn(),
  getChatsInfo: jest.fn(),
  getChat: jest.fn(),
  getAuthInfo: jest.fn(),
  getNotificationCount: jest.fn(),
  getProfile: jest.fn(),
  getContacts: jest.fn(),
  getUsers: jest.fn(),
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

  const account = {
    name: 'name',
    address: 'address',
    pubKey: 'pubKey',
    currency: Currency.DOT,
    balance: 10000,
    planks: '10000000',
  };
  DB.getAccounts.mockReturnValueOnce([account.address]);
  DB.getAccountInfo.mockReturnValueOnce(account);

  const price = 123123;
  DB.getPrice.mockReturnValueOnce(price);

  const txs = new Map([
    [
      'idOne',
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
      },
    ],
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
  ]);
  DB.getTxs.mockReturnValueOnce(txs);
  DB.getPendingTxs.mockReturnValueOnce([txs.get('idTwo').id]);

  const chatsInfo = new Map([
    [
      'idChatInfo',
      {
        id: 'idChatInfo',
        name: 'name',
        lastTxId: 'lastTxId',
        lastTxCurrency: Currency.DOT,
        notificationCount: 10,
        timestamp: new Date().getTime(),
        type: ChatType.WithUser,
        details: {
          currency: Currency.DOT,
          address: 'address',
        },
      },
    ],
  ]);
  DB.getChatsInfo.mockReturnValueOnce(chatsInfo);

  const chats = new Map([[txs.get('idOne').id, txs.get('idOne').currency]]);
  DB.getChat.mockReturnValueOnce(chats);

  const authInfo = {
    isSynced: true,
    isAuthed: false,
    isPasscode: true,
    isBiometry: false,
  };
  DB.getAuthInfo.mockReturnValueOnce(authInfo);

  const notificationCount = 105;
  DB.getNotificationCount.mockReturnValueOnce(notificationCount);

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

  expect(DB.getAccountInfo).toBeCalledWith(account.address);
  expect(DB.getPrice).toBeCalledWith(account.currency);
  expect(DB.getTxs).toBeCalledWith(account.currency);
  expect(DB.getPendingTxs).toBeCalledWith(account.currency);

  expect(DB.getChatsInfo).toBeCalled();
  expect(DB.getChat).toBeCalledWith('idChatInfo');
  expect(DB.getAuthInfo).toBeCalled();
  expect(DB.getNotificationCount).toBeCalled();
  expect(DB.getProfile).toBeCalled();
  expect(DB.getContacts).toBeCalled();
  expect(DB.getUsers).toBeCalled();
});

it('Test updatePrices', async () => {
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
  const price = 123123;
  fetch.mockReturnValueOnce({
    ok: true,
    json: jest.fn(() => ({
      price: price,
    })),
  });

  await tasks.updatePrices(pricesContext, accountsContext);

  expect(pricesContext.dispatch).toBeCalledWith(
    PricesStore.updatePrice(
      accountsContext.state.accounts.get(Currency.DOT).currency,
      price,
    ),
  );
});
