import AsyncStorage from '@react-native-async-storage/async-storage';
import Keychain from 'react-native-keychain';
import { base64Encode, randomAsU8a } from '@polkadot/util-crypto';
import PasscodeUtil from 'utils/passcode';
import { Keyring } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';
import { Account, AccountType, Network } from 'types/account';
import { Currency } from 'types/wallet';
import { AuthInfo } from 'types/authInfo';
import { MyProfile } from 'types/myProfile';
import { User } from 'types/profile';
import ChatsStore from 'storage/Chats';
import ServerInfoStore from 'storage/ServerInfo';
import AccountsStore from 'storage/Accounts';

/**
 * @namespace
 * @category Storage
 */
namespace DB {
  export const NowDBVersion = 1;

  export const secureOption = {
    service: 'com.fractapp',
  };

  export const AsyncStorageKeys = {
    version: 'version',
    profile: 'profile',
    authInfo: 'auth_info',
    serverInfo: 'server_info',
    accountsStore: 'accounts_store',
    contacts: 'contacts',
    users: 'users',
    chatsStorage: 'chatsStorage',
    lastInitMsgTimeout: 'lastInitMsgTimeout',
  };
  export const SecureStorageKeys = {
    firebaseToken: 'firebase_token',
    authJWT: 'auth_jwt',
    seed: 'seed',
    salt: 'salt',
    passcodeHash: 'passcode_hash',
  };
  export const PasscodeStorageKeys = {
    passcode: 'passcode',
  };

  export async function setSecureItem(key: string, value: string) {
    const result = await Keychain.setInternetCredentials(
      key,
      key,
      value,
      secureOption,
    );
    if (result === false) {
      throw new Error(`invalid set ${key}`);
    }
  }
  export async function deleteSecureItem(key: string) {
    await Keychain.resetInternetCredentials(
      key,
      secureOption,
    );
  }
  export async function getSecureItem(key: string): Promise<string | null> {
    const result = await Keychain.getInternetCredentials(key, secureOption);
    if (result === false) {
      return null;
    }

    return result.password;
  }
  export async function deleteItem(key: string) {
    await AsyncStorage.removeItem(key);
  }

  export async function setVersion(version: number) {
    await AsyncStorage.setItem(AsyncStorageKeys.version, String(version));
  }
  export async function getVersion(): Promise<number | null> {
    const result = await AsyncStorage.getItem(AsyncStorageKeys.version);
    if (result == null) {
      return null;
    }
    return Number(result);
  }

  export async function setLastInitMsgTimeout(timestamp: number) {
    await AsyncStorage.setItem(AsyncStorageKeys.lastInitMsgTimeout, String(timestamp));
  }
  export async function getLastInitMsgTimeout(): Promise<number | null> {
    const result = await AsyncStorage.getItem(AsyncStorageKeys.lastInitMsgTimeout);
    if (result == null) {
      return null;
    }
    return Number(result);
  }


  export async function setAuthInfo(auth: AuthInfo) {
    await AsyncStorage.setItem(AsyncStorageKeys.authInfo, JSON.stringify(auth));
  }
  export async function getAuthInfo(): Promise<AuthInfo | null> {
    const result = await AsyncStorage.getItem(AsyncStorageKeys.authInfo);
    if (result == null) {
      return null;
    }
    return JSON.parse(result);
  }

  export async function setServerInfo(serverInfo: ServerInfoStore.State) {
    await AsyncStorage.setItem(AsyncStorageKeys.serverInfo, JSON.stringify(serverInfo));
  }
  export async function getServerInfo(): Promise<ServerInfoStore.State | null> {
    const result = await AsyncStorage.getItem(AsyncStorageKeys.serverInfo);
    if (result == null) {
      return null;
    }
    return JSON.parse(result);
  }

  export async function setProfile(profile: MyProfile | null) {
    await AsyncStorage.setItem(
      AsyncStorageKeys.profile,
      JSON.stringify(profile),
    );
  }
  export async function getProfile(): Promise<MyProfile | null> {
    const result = await AsyncStorage.getItem(AsyncStorageKeys.profile);
    if (result == null) {
      return null;
    }
    return JSON.parse(result);
  }
  export async function changeBiometry(enable: boolean) {
    let authInfo = await getAuthInfo();
    authInfo!.hasBiometry = enable;
    await setAuthInfo(authInfo!);
  }

  export async function enablePasscode(passcode: string) {
    const salt = base64Encode(randomAsU8a(32));
    const hash = PasscodeUtil.hash(passcode, salt);
    let authInfo = await getAuthInfo();
    if (authInfo == null) {
      authInfo = {
        hasWallet: false,
        hasPasscode: false,
        hasBiometry: false,
      };
    }

    try {
      await setSecureItem(SecureStorageKeys.salt, salt);
      await setSecureItem(SecureStorageKeys.passcodeHash, hash);
      authInfo.hasPasscode = true;
    } catch (e) {
      await disablePasscode();
    }

    await setAuthInfo(authInfo);
  }
  export async function disablePasscode() {
    let authInfo = await getAuthInfo();
    if (authInfo == null) {
      authInfo = {
        hasWallet: false,
        hasPasscode: false,
        hasBiometry: false,
      };
    }
    authInfo.hasPasscode = false;
    authInfo.hasBiometry = false;

    await setAuthInfo(authInfo);

    await Keychain.resetInternetCredentials(
      SecureStorageKeys.salt,
      secureOption,
    );
    await Keychain.resetInternetCredentials(
      SecureStorageKeys.passcodeHash,
      secureOption,
    );
  }

  export async function getSalt(): Promise<string | null> {
    return await getSecureItem(SecureStorageKeys.salt);
  }
  export async function getPasscodeHash(): Promise<string | null> {
    return await getSecureItem(SecureStorageKeys.passcodeHash);
  }

  export async function createAccounts(seed: string) {
    let polkadotWallet = new Keyring({
      type: 'sr25519',
      ss58Format: 0,
    }).addFromUri(seed);
    let kusamaWallet = new Keyring({ type: 'sr25519', ss58Format: 2 }).addFromUri(
      seed,
    );
    let accountsByCurrency: {
      [id in Currency]: Account
    } = <{
      [id in Currency]: Account
    }>{};

    accountsByCurrency[Currency.DOT] = {
      name: 'Polkadot',
      address: polkadotWallet.address,
      pubKey: u8aToHex(polkadotWallet.publicKey),
      currency: Currency.DOT,
      viewBalance: 0,
      type: AccountType.Main,
      balance: {
        total: '0',
        transferable: '0',
        payableForFee: '0',
      },
      network: Network.Polkadot,
    };
    accountsByCurrency[Currency.KSM] = {
      name: 'Kusama',
      address: kusamaWallet.address,
      pubKey: u8aToHex(kusamaWallet.publicKey),
      currency: Currency.KSM,
      viewBalance: 0,
      type: AccountType.Main,
      balance: {
        total: '0',
        transferable: '0',
        payableForFee: '0',
      },
      network: Network.Kusama,
    };

    const accounts: {
      [type in AccountType]: {
        [id in Currency]: Account
      }
    } = <{
      [type in AccountType]: {
        [id in Currency]: Account
      }
    }>{};

    accounts[AccountType.Main] = accountsByCurrency;

    await setAccountStore(<AccountsStore.State>{
      accounts: accounts,
      isInitialized: true,
    });
    await setSecureItem(SecureStorageKeys.seed, seed);

    await DB.setVersion(DB.NowDBVersion);
  }
  export async function getSeed(): Promise<string | null> {
    return await getSecureItem(SecureStorageKeys.seed);
  }

  export async function setChatsState(state: ChatsStore.State) {
    await AsyncStorage.setItem(
      AsyncStorageKeys.chatsStorage,
      JSON.stringify(state),
    );
  }
  export async function getChatsState(): Promise<ChatsStore.State> {
    const result = await AsyncStorage.getItem(AsyncStorageKeys.chatsStorage);

    if (result == null) {
      return ChatsStore.initialState();
    }
    return JSON.parse(result);
  }

  export async function setContacts(contacts: Array<string>) {
    await AsyncStorage.setItem(
      AsyncStorageKeys.contacts,
      JSON.stringify(contacts),
    );
  }
  export async function getContacts(): Promise<Array<string>> {
    const result = await AsyncStorage.getItem(AsyncStorageKeys.contacts);

    if (result == null) {
      return [];
    }

    return JSON.parse(result);
  }

  export async function setUsers(users: {
    [id in string]: User
  }) {
    await AsyncStorage.setItem(
      AsyncStorageKeys.users,
      JSON.stringify(users),
    );
  }

  export async function getUsers(): Promise<{
    [id in string]: User
  }> {
    const result = await AsyncStorage.getItem(AsyncStorageKeys.users);

    if (result == null) {
      return {};
    }
    return JSON.parse(result);
  }

  export async function setAccountStore(state: AccountsStore.State) {
    await AsyncStorage.setItem(
      AsyncStorageKeys.accountsStore,
      JSON.stringify(state),
    );
  }
  export async function getAccountStore(): Promise<AccountsStore.State | null> {
    const result = await AsyncStorage.getItem(
      AsyncStorageKeys.accountsStore
    );
    if (result == null) {
      return null;
    }
    return JSON.parse(result);
  }

  export async function setFirebaseToken(token: string) {
    await setSecureItem(SecureStorageKeys.firebaseToken, token);
  }
  export async function getFirebaseToken(): Promise<string | null> {
    return await getSecureItem(SecureStorageKeys.firebaseToken);
  }

  export async function setJWT(token: string | null) {
    if (token == null) {
      await deleteSecureItem(SecureStorageKeys.authJWT);
    } else {
      await setSecureItem(SecureStorageKeys.authJWT, token);
    }
  }
  export async function getJWT(): Promise<string | null> {
    return await getSecureItem(SecureStorageKeys.authJWT);
  }
}

export default DB;
