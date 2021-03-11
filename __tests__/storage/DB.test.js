import DB, {
  AsyncStorageKeys,
  biometryOption,
  PasscodeStorageKeys,
  SecureStorageKeys,
  setSecureItem,
} from 'storage/DB';
import Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Currency} from 'types/wallet';
import string from 'utils/string';
import {ChatType} from 'types/chatInfo';
import {TxStatus, TxType} from 'types/transaction';

jest.mock('react-native-keychain', () => ({
  setInternetCredentials: jest.fn(),
  getInternetCredentials: jest.fn(),
  ACCESS_CONTROL: {
    BIOMETRY_CURRENT_SET: 0,
  },
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));
jest.mock('@polkadot/util-crypto', () => ({
  setAccountInfo: jest.fn(),
}));
jest.mock('@polkadot/keyring', () => {});
jest.mock('@polkadot/util', () => ({
  u8aToHex: jest.fn(),
}));
jest.mock('utils/passcode', () => {});
jest.mock('@polkadot/util-crypto', () => ({
  base64Encode: jest.fn(),
  randomAsU8a: jest.fn(),
}));

it('Test secureOption', async () => {
  expect(DB.secureOption).toMatchSnapshot();
});
it('Test biometryOption', async () => {
  expect(DB.biometryOption).toMatchSnapshot();
});
it('Test AsyncStorageKeys', async () => {
  expect(DB.AsyncStorageKeys).toMatchSnapshot();
});
it('Test SecureStorageKeys', async () => {
  expect(DB.SecureStorageKeys).toMatchSnapshot();
});
it('Test PasscodeStorageKeys', async () => {
  expect(DB.PasscodeStorageKeys).toMatchSnapshot();
});

it('Test setSecureItem positive', async () => {
  const key = 'key';
  const value = 'value';
  await DB.setSecureItem(key, value);
  expect(Keychain.setInternetCredentials).toBeCalledWith(
    key,
    key,
    value,
    DB.secureOption,
  );
});
it('Test setSecureItem negative', async () => {
  const key = 'key';
  const value = 'value';
  Keychain.setInternetCredentials.mockReturnValueOnce(false);
  await expect(DB.setSecureItem(key, value)).rejects.toThrow(
    `invalid set ${key}`,
  );

  expect(Keychain.setInternetCredentials).toBeCalledWith(
    key,
    key,
    value,
    DB.secureOption,
  );
});
it('Test getSecureItem positive', async () => {
  const key = 'key';
  const value = 'value';
  Keychain.getInternetCredentials.mockReturnValueOnce({
    password: value,
  });
  const item = await DB.getSecureItem(key);
  expect(item).toEqual(value);
  expect(Keychain.getInternetCredentials).toBeCalledWith(key, DB.secureOption);
});
it('Test getSecureItem negative', async () => {
  const key = 'key';
  Keychain.getInternetCredentials.mockReturnValueOnce(false);
  const item = await DB.getSecureItem(key);
  expect(item).toEqual(null);
  expect(Keychain.getInternetCredentials).toBeCalledWith(key, DB.secureOption);
});

it('Test setAuthInfo', async () => {
  const auth = {
    isSynced: false,
    isAuthed: true,
    isPasscode: false,
    isBiometry: true,
  };
  await DB.setAuthInfo(auth);
  expect(AsyncStorage.setItem).toBeCalledWith(
    DB.AsyncStorageKeys.authInfo,
    JSON.stringify(auth),
  );
});
it('Test getAuthInfo negative', async () => {
  AsyncStorage.getItem.mockReturnValueOnce(null);

  const value = await DB.getAuthInfo();
  expect(value).toEqual(null);
});
it('Test getAuthInfo positive', async () => {
  const auth = {
    isSynced: false,
    isAuthed: true,
    isPasscode: false,
    isBiometry: true,
  };

  AsyncStorage.getItem.mockReturnValueOnce(JSON.stringify(auth));
  const value = await DB.getAuthInfo();
  expect(value).toEqual(auth);
});

it('Test setPrice', async () => {
  const currency = Currency.Kusama;
  const number = 100;
  await DB.setPrice(currency, number);
  expect(AsyncStorage.setItem).toBeCalledWith(
    DB.AsyncStorageKeys.price(currency),
    String(number),
  );
});
it('Test getPrice negative', async () => {
  AsyncStorage.getItem.mockReturnValueOnce(null);

  const value = await DB.getPrice(Currency.Polkadot);
  expect(value).toEqual(0);
});
it('Test getPrice positive', async () => {
  const currency = Currency.Kusama;
  const number = 100;

  AsyncStorage.getItem.mockReturnValueOnce(String(number));
  const value = await DB.getPrice(currency);
  expect(value).toEqual(number);
});

it('Test setProfile', async () => {
  const profile = {
    id: 'id',
    name: 'name',
    username: 'username',
    phoneNumber: 'phone',
    email: 'email',
    isMigratory: false,
    avatarExt: 'png',
    lastUpdate: 123,
  };
  await DB.setProfile(profile);
  expect(AsyncStorage.setItem).toBeCalledWith(
    DB.AsyncStorageKeys.profile,
    JSON.stringify(profile),
  );
});
it('Test getProfile negative', async () => {
  AsyncStorage.getItem.mockReturnValueOnce(null);

  const value = await DB.getProfile();
  expect(value).toEqual(null);
});
it('Test getProfile positive', async () => {
  const profile = {
    id: 'id',
    name: 'name',
    username: 'username',
    phoneNumber: 'phone',
    email: 'email',
    isMigratory: false,
    avatarExt: 'png',
    lastUpdate: 123,
  };

  AsyncStorage.getItem.mockReturnValueOnce(JSON.stringify(profile));
  const p = await DB.getProfile();
  expect(p).toEqual(profile);
  expect(AsyncStorage.getItem).toBeCalledWith(DB.AsyncStorageKeys.profile);
});

it('Test setNotificationCount', async () => {
  await DB.setNotificationCount(10);
  expect(AsyncStorage.setItem).toBeCalledWith(
    DB.AsyncStorageKeys.notificationCount,
    String(10),
  );
});
it('Test getNotificationCount negative', async () => {
  AsyncStorage.getItem.mockReturnValueOnce(null);

  const value = await DB.getNotificationCount();
  expect(value).toEqual(0);
});
it('Test getNotificationCount positive', async () => {
  AsyncStorage.getItem.mockReturnValueOnce(String(10));
  const n = await DB.getNotificationCount();
  expect(n).toEqual(10);
  expect(AsyncStorage.getItem).toBeCalledWith(
    DB.AsyncStorageKeys.notificationCount,
  );
});

it('Test getSalt', async () => {
  const v = 'value';
  Keychain.getInternetCredentials.mockReturnValueOnce({
    password: v,
  });
  const salt = await DB.getSalt();
  expect(salt).toEqual(v);
  expect(Keychain.getInternetCredentials).toBeCalledWith(
    DB.SecureStorageKeys.salt,
    DB.secureOption,
  );
});
it('Test getPasscodeHash', async () => {
  const v = 'value';
  Keychain.getInternetCredentials.mockReturnValueOnce({
    password: v,
  });
  const hash = await DB.getPasscodeHash();
  expect(hash).toEqual(v);
  expect(Keychain.getInternetCredentials).toBeCalledWith(
    DB.SecureStorageKeys.passcodeHash,
    DB.secureOption,
  );
});
it('Test getSeed', async () => {
  const v = 'value';
  Keychain.getInternetCredentials.mockReturnValueOnce({
    password: v,
  });
  const seed = await DB.getSeed();
  expect(seed).toEqual(v);
  expect(Keychain.getInternetCredentials).toBeCalledWith(
    DB.SecureStorageKeys.seed,
    DB.secureOption,
  );
});

it('Test setAccounts', async () => {
  const accounts = ['account1', 'account2'];
  await DB.setAccounts(accounts);
  expect(AsyncStorage.setItem).toBeCalledWith(
    DB.AsyncStorageKeys.accounts,
    JSON.stringify(accounts),
  );
});
it('Test getAccounts positive', async () => {
  const accounts = ['account1', 'account2'];
  AsyncStorage.getItem.mockReturnValueOnce(JSON.stringify(accounts));

  const a = await DB.getAccounts(accounts);
  expect(a).toEqual(accounts);
  expect(AsyncStorage.getItem).toBeCalledWith(DB.AsyncStorageKeys.accounts);
});
it('Test getAccounts negative', async () => {
  AsyncStorage.getItem.mockReturnValueOnce(null);

  const value = await DB.getAccounts();
  expect(value).toEqual(null);
});

it('Test setChatsInfo', async () => {
  const chatsInfo = new Map([
    [
      'idChatInfo',
      {
        id: 'idChatInfo',
        name: 'name',
        lastTxId: 'lastTxId',
        lastTxCurrency: Currency.Polkadot,
        notificationCount: 10,
        timestamp: new Date().getTime(),
        type: ChatType.Chat,
        details: {
          currency: Currency.Polkadot,
          address: 'address',
        },
      },
    ],
  ]);

  await DB.setChatsInfo(chatsInfo);
  expect(AsyncStorage.setItem).toBeCalledWith(
    DB.AsyncStorageKeys.chatsInfo,
    JSON.stringify([...chatsInfo]),
  );
});
it('Test getChatsInfo positive', async () => {
  const chatsInfo = new Map([
    [
      'idChatInfo',
      {
        id: 'idChatInfo',
        name: 'name',
        lastTxId: 'lastTxId',
        lastTxCurrency: Currency.Polkadot,
        notificationCount: 10,
        timestamp: new Date().getTime(),
        type: ChatType.Chat,
        details: {
          currency: Currency.Polkadot,
          address: 'address',
        },
      },
    ],
  ]);
  AsyncStorage.getItem.mockReturnValueOnce(JSON.stringify([...chatsInfo]));

  const c = await DB.getChatsInfo();
  expect(c).toEqual(chatsInfo);
  expect(AsyncStorage.getItem).toBeCalledWith(DB.AsyncStorageKeys.chatsInfo);
});
it('Test getChatsInfo negative', async () => {
  AsyncStorage.getItem.mockReturnValueOnce(null);

  const value = await DB.getChatsInfo();
  expect(value).toEqual(new Map());
});

it('Test setChat', async () => {
  const chatId = 'chatId';
  const chats = new Map([['txIdOne', Currency.Polkadot]]);

  await DB.setChat(chatId, chats);
  expect(AsyncStorage.setItem).toBeCalledWith(
    DB.AsyncStorageKeys.chatByChatId(chatId),
    JSON.stringify([...chats]),
  );
});
it('Test getChat positive', async () => {
  const chatId = 'chatId';
  const chats = new Map([['txIdOne', Currency.Polkadot]]);
  AsyncStorage.getItem.mockReturnValueOnce(JSON.stringify([...chats]));

  const c = await DB.getChat(chatId);
  expect(c).toEqual(chats);
  expect(AsyncStorage.getItem).toBeCalledWith(
    DB.AsyncStorageKeys.chatByChatId(chatId),
  );
});
it('Test getChat negative', async () => {
  AsyncStorage.getItem.mockReturnValueOnce(null);

  const value = await DB.getChat();
  expect(value).toEqual(new Map());
});

it('Test setTx', async () => {
  const tx = {
    id: 'txIdOne',
    userId: 'userId',
    address: 'address#1',
    currency: Currency.Polkadot,
    txType: TxType.None,
    timestamp: new Date('12-12-2020').getTime(),
    value: 10,
    usdValue: 10,
    fee: 10,
    usdFee: 10,
    status: TxStatus.Success,
  };

  await DB.setTx(Currency.Polkadot, tx);
  expect(AsyncStorage.setItem).toBeCalledWith(
    DB.AsyncStorageKeys.transactions(Currency.Polkadot),
    JSON.stringify([
      ...new Map([
        [
          'txIdOne',
          {
            id: 'txIdOne',
            userId: 'userId',
            address: 'address#1',
            currency: Currency.Polkadot,
            txType: TxType.None,
            timestamp: new Date('12-12-2020').getTime(),
            value: 10,
            usdValue: 10,
            fee: 10,
            usdFee: 10,
            status: TxStatus.Success,
          },
        ],
      ]),
    ]),
  );
});
it('Test getTxs positive', async () => {
  const txs = new Map([
    [
      'txOne',
      {
        id: 'txIdOne',
        userId: 'userId',
        address: 'address#1',
        currency: Currency.Polkadot,
        txType: TxType.None,
        timestamp: new Date('12-12-2020').getTime(),
        value: 10,
        usdValue: 10,
        fee: 10,
        usdFee: 10,
        status: TxStatus.Success,
      },
    ],
  ]);
  AsyncStorage.getItem.mockReturnValueOnce(JSON.stringify([...txs]));

  const t = await DB.getTxs(Currency.Polkadot);
  expect(t).toEqual(txs);
  expect(AsyncStorage.getItem).toBeCalledWith(
    DB.AsyncStorageKeys.transactions(Currency.Polkadot),
  );
});
it('Test getTxs negative', async () => {
  AsyncStorage.getItem.mockReturnValueOnce(null);

  const value = await DB.getTxs(Currency.Polkadot);
  expect(value).toEqual(new Map());
});

it('Test setContacts', async () => {
  const contacts = [
    {
      id: 'id',
      name: 'name',
      username: 'username',
      avatarExt: 'png',
      lastUpdate: new Date('12-12-2020').getTime(),
      addresses: {
        0: 'addressOne',
        1: 'addressTwo',
      },
    },
  ];

  await DB.setContacts(contacts);
  expect(AsyncStorage.setItem).toBeCalledWith(
    DB.AsyncStorageKeys.contacts,
    JSON.stringify(contacts),
  );
});
it('Test getContacts positive', async () => {
  const contacts = [
    {
      id: 'id',
      name: 'name',
      username: 'username',
      avatarExt: 'png',
      lastUpdate: new Date('12-12-2020').getTime(),
      addresses: {
        0: 'addressOne',
        1: 'addressTwo',
      },
    },
  ];
  AsyncStorage.getItem.mockReturnValueOnce(JSON.stringify([...contacts]));

  const c = await DB.getContacts();
  expect(c).toEqual(contacts);
  expect(AsyncStorage.getItem).toBeCalledWith(DB.AsyncStorageKeys.contacts);
});
it('Test getContacts negative', async () => {
  AsyncStorage.getItem.mockReturnValueOnce(null);

  const value = await DB.getContacts();
  expect(value).toEqual([]);
});

it('Test setUsers', async () => {
  const users = new Map([
    [
      'userId',
      {
        id: 'userId',
        name: 'name',
        username: 'username',
        avatarExt: 'png',
        lastUpdate: new Date('12-12-2020').getTime(),
        addresses: {
          0: 'addressOne',
          1: 'addressTwo',
        },
      },
    ],
  ]);

  await DB.setUsers(users);
  expect(AsyncStorage.setItem).toBeCalledWith(
    DB.AsyncStorageKeys.users,
    JSON.stringify([...users]),
  );
});
it('Test getUsers positive', async () => {
  const users = new Map([
    [
      'userId',
      {
        id: 'userId',
        name: 'name',
        username: 'username',
        avatarExt: 'png',
        lastUpdate: new Date('12-12-2020').getTime(),
        addresses: {
          0: 'addressOne',
          1: 'addressTwo',
        },
      },
    ],
  ]);
  AsyncStorage.getItem.mockReturnValueOnce(JSON.stringify([...users]));

  const u = await DB.getUsers();
  expect(u).toEqual(users);
  expect(AsyncStorage.getItem).toBeCalledWith(DB.AsyncStorageKeys.users);
});
it('Test getUsers negative', async () => {
  AsyncStorage.getItem.mockReturnValueOnce(null);

  const value = await DB.getUsers();
  expect(value).toEqual(new Map());
});

it('Test setPendingTxs', async () => {
  const txs = ['txOne', 'txTwo'];

  await DB.setPendingTxs(Currency.Kusama, txs);
  expect(AsyncStorage.setItem).toBeCalledWith(
    DB.AsyncStorageKeys.pendingTransactions(Currency.Kusama),
    JSON.stringify(txs),
  );
});
it('Test getPendingTxs positive', async () => {
  const txs = ['txOne', 'txTwo'];
  AsyncStorage.getItem.mockReturnValueOnce(JSON.stringify(txs));

  const pTx = await DB.getPendingTxs(Currency.Polkadot);
  expect(pTx).toEqual(txs);
  expect(AsyncStorage.getItem).toBeCalledWith(
    DB.AsyncStorageKeys.pendingTransactions(Currency.Polkadot),
  );
});
it('Test getPendingTxs negative', async () => {
  AsyncStorage.getItem.mockReturnValueOnce(null);

  const value = await DB.getPendingTxs(Currency.Polkadot);
  expect(value).toEqual([]);
});

it('Test setAccountInfo', async () => {
  const info = {
    name: 'name',
    address: 'address',
    pubKey: 'pubKey',
    currency: Currency.Polkadot,
    balance: 100,
    planks: '1000000',
  };

  await DB.setAccountInfo(info);
  expect(AsyncStorage.setItem).toBeCalledWith(
    DB.AsyncStorageKeys.accountInfo(info.address),
    JSON.stringify(info),
  );
});
it('Test getAccountInfo positive', async () => {
  const info = {
    name: 'name',
    address: 'address',
    pubKey: 'pubKey',
    currency: Currency.Polkadot,
    balance: 100,
    planks: '1000000',
  };
  const address = 'address';
  AsyncStorage.getItem.mockReturnValueOnce(JSON.stringify(info));

  const a = await DB.getAccountInfo(address);
  expect(a).toEqual(info);
  expect(AsyncStorage.getItem).toBeCalledWith(
    DB.AsyncStorageKeys.accountInfo(address),
  );
});
it('Test getAccountInfo negative', async () => {
  AsyncStorage.getItem.mockReturnValueOnce(null);

  const value = await DB.getAccountInfo();
  expect(value).toEqual(null);
});

it('Test setFirebaseToken', async () => {
  const v = 'value';
  await DB.setFirebaseToken(v);
  expect(Keychain.setInternetCredentials).toBeCalledWith(
    DB.SecureStorageKeys.firebaseToken,
    DB.SecureStorageKeys.firebaseToken,
    v,
    DB.secureOption,
  );
});
it('Test getFirebaseToken', async () => {
  const v = 'value';
  Keychain.getInternetCredentials.mockReturnValueOnce({
    password: v,
  });
  const token = await DB.getFirebaseToken();
  expect(token).toEqual(v);
  expect(Keychain.getInternetCredentials).toBeCalledWith(
    DB.SecureStorageKeys.firebaseToken,
    DB.secureOption,
  );
});

it('Test setJWT', async () => {
  const v = 'value';
  await DB.setJWT(v);
  expect(Keychain.setInternetCredentials).toBeCalledWith(
    DB.SecureStorageKeys.authJWT,
    DB.SecureStorageKeys.authJWT,
    v,
    DB.secureOption,
  );
});
it('Test getJWT', async () => {
  const v = 'value';
  Keychain.getInternetCredentials.mockReturnValueOnce({
    password: v,
  });
  const token = await DB.getJWT();
  expect(token).toEqual(v);
  expect(Keychain.getInternetCredentials).toBeCalledWith(
    DB.SecureStorageKeys.authJWT,
    DB.secureOption,
  );
});

it('Test getPasscode positive', async () => {
  const value = 'value';
  Keychain.getInternetCredentials.mockReturnValueOnce({
    password: value,
  });
  const v = await DB.getPasscode();
  expect(Keychain.getInternetCredentials).toBeCalledWith(
    DB.PasscodeStorageKeys.passcode,
    DB.biometryOption,
  );
  expect(v).toEqual(value);
});
it('Test getPasscode negative', async () => {
  Keychain.getInternetCredentials.mockReturnValueOnce(false);
  await expect(DB.getPasscode()).rejects.toThrow(
    'value by passcode key not found',
  );
  expect(Keychain.getInternetCredentials).toBeCalledWith(
    DB.PasscodeStorageKeys.passcode,
    DB.biometryOption,
  );
});
