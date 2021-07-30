import AsyncStorage from '@react-native-async-storage/async-storage';
import Keychain from 'react-native-keychain';
import {base64Encode, randomAsU8a} from '@polkadot/util-crypto';
import PasscodeUtil from 'utils/passcode';
import {Keyring} from '@polkadot/keyring';
import {u8aToHex} from '@polkadot/util';
import {Account, Network} from 'types/account';
import {Currency} from 'types/wallet';
import {AuthInfo} from 'types/authInfo';
import {MyProfile} from 'types/myProfile';
import {User} from 'types/profile';
import BN from 'bn.js';
import ChatsStore from 'storage/Chats';
import ServerInfoStore from 'storage/ServerInfo';

/**
 * @namespace
 * @category Storage
 */

namespace DB {
  export const secureOption = {
    service: 'com.fractapp',
  };
  export const biometryOption = {
    service: 'com.fractapp',
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
    authenticationPrompt: {
      title: 'Please Authenticate',
    },
  };

  export const AsyncStorageKeys = {
    profile: 'profile',
    authInfo: 'auth_info',
    serverInfo: 'server_info',
    accounts: 'accounts',
    contacts: 'contacts',
    users: 'users',
    accountInfo: (address: string) => `account_${address}`,
    chatsStorage: 'chatsStorage',
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
  export async function getSecureItem(key: string): Promise<string | null> {
    const result = await Keychain.getInternetCredentials(key, secureOption);
    if (result === false) {
      return null;
    }

    return result.password;
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

  export async function enablePasscode(passcode: string, isBiometry: boolean) {
    if (isBiometry) {
      const result = await Keychain.setInternetCredentials(
        PasscodeStorageKeys.passcode,
        PasscodeStorageKeys.passcode,
        passcode,
        biometryOption,
      );
      if (result === false) {
        throw new Error('invalid set passcode');
      }
    }

    const salt = base64Encode(randomAsU8a(32));
    const hash = PasscodeUtil.hash(passcode, salt);
    let authInfo = await getAuthInfo();
    if (authInfo == null) {
      authInfo = {
        isSynced: false,
        hasWallet: false,
        hasPasscode: false,
        hasBiometry: false,
      };
    }

    try {
      await setSecureItem(SecureStorageKeys.salt, salt);
      await setSecureItem(SecureStorageKeys.passcodeHash, hash);
      authInfo.hasPasscode = true;
      authInfo.hasBiometry = isBiometry;
    } catch (e) {
      await disablePasscode();
    }

    await setAuthInfo(authInfo);
  }
  export async function disablePasscode() {
    let authInfo = await getAuthInfo();
    if (authInfo == null) {
      authInfo = {
        isSynced: false,
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
  export async function getPasscode(): Promise<string> {
    const result = await Keychain.getInternetCredentials(
      PasscodeStorageKeys.passcode,
      biometryOption,
    );
    if (result === false) {
      throw new Error('value by passcode key not found');
    }

    return result.password;
  }

  export async function createAccounts(seed: string) {
    let polkadotWallet = new Keyring({
      type: 'sr25519',
      ss58Format: 0,
    }).addFromUri(seed);
    let kusamaWallet = new Keyring({type: 'sr25519', ss58Format: 2}).addFromUri(
      seed,
    );
    let accountsInfo = new Array<Account>(
      {
        name: 'Polkadot wallet',
        address: polkadotWallet.address,
        pubKey: u8aToHex(polkadotWallet.publicKey),
        currency: Currency.DOT,
        balance: 0,
        planks: new BN(0).toString(),
        network: Network.Polkadot,
      },
      {
        name: 'Kusama wallet',
        address: kusamaWallet.address,
        pubKey: u8aToHex(kusamaWallet.publicKey),
        currency: Currency.KSM,
        balance: 0,
        planks: new BN(0).toString(),
        network: Network.Kusama,
      },
    );
    let accounts = new Array<string>();
    for (let i = 0; i < accountsInfo.length; i++) {
      const account = accountsInfo[i];
      accounts.push(account.address);
      await setAccountInfo(account);
    }
    await setAccounts(accounts);
    await setSecureItem(SecureStorageKeys.seed, seed);
  }
  export async function getSeed(): Promise<string | null> {
    return await getSecureItem(SecureStorageKeys.seed);
  }

  export async function setAccounts(accounts: Array<string>) {
    await AsyncStorage.setItem(
      AsyncStorageKeys.accounts,
      JSON.stringify(accounts),
    );
  }
  export async function getAccounts(): Promise<Array<string> | null> {
    const result = await AsyncStorage.getItem(AsyncStorageKeys.accounts);
    if (result == null) {
      return null;
    }
    return JSON.parse(result);
  }

  export async function setChatsState(state: ChatsStore.State) {
    const mapReplacer = (key: any, value: any) => {
      if (value instanceof Map) {
        return {
          dataType: 'Map',
          value: Array.from(value.entries()), // or with spread: value: [...value]
        };
      } else {
        return value;
      }
    };

    await AsyncStorage.setItem(
      AsyncStorageKeys.chatsStorage,
      JSON.stringify(state, mapReplacer),
    );
  }
  export async function getChatsState(): Promise<ChatsStore.State> {
    const mapReviver = (key: any, value: any) => {
      if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
          return new Map(value.value);
        }
      }
      return value;
    };

    const result = await AsyncStorage.getItem(AsyncStorageKeys.chatsStorage);

    if (result == null) {
      return ChatsStore.initialState();
    }
    return JSON.parse(result, mapReviver);
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

  export async function setUsers(users: Record<string, User>) {
    await AsyncStorage.setItem(
      AsyncStorageKeys.users,
      JSON.stringify(users),
    );
  }

  export async function getUsers(): Promise<Record<string, User>> {
    const result = await AsyncStorage.getItem(AsyncStorageKeys.users);

    if (result == null) {
      return {};
    }
    return JSON.parse(result);
  }

  export async function setAccountInfo(account: Account) {
    await AsyncStorage.setItem(
      AsyncStorageKeys.accountInfo(account.address),
      JSON.stringify(account),
    );
  }
  export async function getAccountInfo(
    address: string,
  ): Promise<Account | null> {
    const result = await AsyncStorage.getItem(
      AsyncStorageKeys.accountInfo(address),
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

  export async function setJWT(token: string) {
    await setSecureItem(SecureStorageKeys.authJWT, token);
  }
  export async function getJWT(): Promise<string | null> {
    return await getSecureItem(SecureStorageKeys.authJWT);
  }
}

export default DB;
