import Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Currency} from 'types/wallet';
import DB from 'storage/DB';
import AccountsStore from 'storage/Accounts';
import ChatsStore from 'storage/Chats';

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
jest.mock('utils/passcode', () => ({
  hash: jest.fn(),
}));
jest.mock('@polkadot/util-crypto', () => ({
  base64Encode: jest.fn(),
  randomAsU8a: jest.fn(),
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));


it('Test secureOption', async () => {
  expect(DB.secureOption).toMatchSnapshot();
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
    isFirstSync: true,
    hasWallet: true,
    hasPasscode: true,
    hasBiometry: true,
  };

  AsyncStorage.getItem.mockReturnValueOnce(JSON.stringify(auth));
  const value = await DB.getAuthInfo();
  expect(value).toEqual(auth);
});


it('Test setProfile', async () => {
  const profile = {
    id: 'id',
    name: 'name',
    username: 'username',
    phoneNumber: 'phone',
    email: 'email',
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
    avatarExt: 'png',
    lastUpdate: 123,
  };

  AsyncStorage.getItem.mockReturnValueOnce(JSON.stringify(profile));
  const p = await DB.getProfile();
  expect(p).toEqual(profile);
  expect(AsyncStorage.getItem).toBeCalledWith(DB.AsyncStorageKeys.profile);
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
  const state = AccountsStore.initialState();
  await DB.setAccountStore(state);
  expect(AsyncStorage.setItem).toBeCalledWith(
    DB.AsyncStorageKeys.accountsStore,
    JSON.stringify(state),
  );
});
it('Test getAccounts positive', async () => {
  const state = AccountsStore.initialState();
  AsyncStorage.getItem.mockReturnValueOnce(JSON.stringify(state));

  const a = await DB.getAccountStore();
  expect(a).toEqual(state);
  expect(AsyncStorage.getItem).toBeCalledWith(DB.AsyncStorageKeys.accountsStore);
});
it('Test getAccounts negative', async () => {
  AsyncStorage.getItem.mockReturnValueOnce(null);

  const value = await DB.getAccountStore();
  expect(value).toEqual(null);
});

it('Test getChatsState positive', async () => {
  const state = ChatsStore.initialState();

  AsyncStorage.getItem.mockReturnValueOnce(JSON.stringify(state));

  const c = await DB.getChatsState();
  expect(c).toEqual(state);
  expect(AsyncStorage.getItem).toBeCalledWith(DB.AsyncStorageKeys.chatsStorage);
});

it('Test setChatsState', async () => {
  const state = ChatsStore.initialState();

  await DB.setChatsState(state);
  expect(AsyncStorage.setItem).toBeCalledWith(
    DB.AsyncStorageKeys.chatsStorage,
    JSON.stringify(state),
  );
});

it('Test setContacts', async () => {
  const contacts = [ 'a', 'b' ];

  await DB.setContacts(contacts);
  expect(AsyncStorage.setItem).toBeCalledWith(
    DB.AsyncStorageKeys.contacts,
    JSON.stringify(contacts),
  );
});
it('Test getContacts positive', async () => {
  const contacts = [ 'a', 'b' ];

  AsyncStorage.getItem.mockReturnValueOnce(JSON.stringify(contacts));

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
 const users = {
   'userId': {
     isAddressOnly: true,
     title: 'title',
     value: {
       address: 'address',
       currency: Currency.DOT,
     },
   },
 };

  await DB.setUsers(users);
  expect(AsyncStorage.setItem).toBeCalledWith(
    DB.AsyncStorageKeys.users,
    JSON.stringify(users),
  );
});
it('Test getUsers positive', async () => {
  const users = {
    'userId': {
      isAddressOnly: true,
      title: 'title',
      value: {
        address: 'address',
        currency: Currency.DOT,
      },
    },
  };

  AsyncStorage.getItem.mockReturnValueOnce(JSON.stringify(users));

  const u = await DB.getUsers();
  expect(u).toEqual(users);
  expect(AsyncStorage.getItem).toBeCalledWith(DB.AsyncStorageKeys.users);
});
it('Test getUsers negative', async () => {
  AsyncStorage.getItem.mockReturnValueOnce(null);

  const value = await DB.getUsers();
  expect(value).toEqual({});
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
