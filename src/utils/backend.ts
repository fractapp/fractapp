import DB from 'storage/DB';
import {Keyring} from '@polkadot/keyring';
import {stringToU8a, u8aToHex} from '@polkadot/util';
import {Currency} from 'types/wallet';

// @ts-ignore
import {FRACTAPP_API} from '@env';
import {KeyringPair} from '@polkadot/keyring/types';
import {MyProfile} from 'types/myProfile';
import {UserProfile} from 'types/profile';

/**
 * @namespace
 * @category Utils
 */
namespace BackendApi {
  export enum CheckType {
    Auth = 0,
    Change,
  }
  export enum Network {
    Polkadot = 0,
    Kusama,
  }
  export enum CodeType {
    Phone = 0,
    Email,
  }

  const cacheTimeout = 36000000; // 10 minutes

  let userByAddressCache = new Map<string, UserProfile>();
  let timeForCache = new Map<string, number>();

  const apiUrl = FRACTAPP_API;
  const signTokenMsg = 'It is my firebase token for fractapp:';
  const authMsg = 'It is my fractapp rq:';
  const signAddressMsg = 'It is my auth key for fractapp:';
  export const CodeLength = 6;
  let JWTToken: string | null = null;

  export async function getJWT(): Promise<string> {
    if (JWTToken == null) {
      JWTToken = await DB.getJWT();
    }
    return <string>JWTToken;
  }
  export async function setToken(token: string): Promise<boolean> {
    const accounts = await DB.getAccounts();
    const seed = await DB.getSeed();

    if (accounts == null || seed == null) {
      return false;
    }

    let key = new Keyring({type: 'sr25519'}).addFromUri(seed);
    let ok = true;
    for (let account of accounts) {
      const accountInfo = await DB.getAccountInfo(account);

      if (accountInfo == null) {
        continue;
      }

      const time = Math.round(new Date().getTime() / 1000);
      const msg = signTokenMsg + token + time;
      let network = Network.Polkadot;
      switch (accountInfo.currency) {
        case Currency.Polkadot:
          network = Network.Polkadot;
          break;
        case Currency.Kusama:
          network = Network.Kusama;
          break;
      }
      const response = await fetch(`${apiUrl}/notification/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pubKey: accountInfo.pubKey,
          address: accountInfo.address,
          network: network,
          sign: u8aToHex(key.sign(stringToU8a(msg))),
          token: token,
          timestamp: time,
        }),
      });

      if (!response.ok) {
        ok = response.ok;
      }
    }

    return ok;
  }

  export async function sendCode(
    value: string,
    type: CodeType,
    checkType: CheckType,
  ): Promise<number> {
    const response = await fetch(`${apiUrl}/auth/sendCode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: type,
        value: value,
        checkType: checkType,
      }),
    });

    return response.status;
  }

  export async function auth(
    value: string,
    code: string,
    type: CodeType,
  ): Promise<number> {
    const seed = await DB.getSeed();
    const accounts = await DB.getAccounts();

    if (accounts == null || seed == null) {
      return 400;
    }

    let key = new Keyring({type: 'sr25519'}).addFromUri(seed);

    let authKey = new Keyring({type: 'sr25519'}).addFromUri(seed + '//auth');

    let accountsRq = {};
    const time = Math.round(new Date().getTime() / 1000);
    const authPubKey = u8aToHex(authKey.publicKey);
    for (let account of accounts) {
      const accountInfo = await DB.getAccountInfo(account);

      if (accountInfo == null) {
        continue;
      }

      const msg = signAddressMsg + authPubKey + time;
      // @ts-ignore
      accountsRq[accountInfo.currency] = {
        Address: accountInfo.address,
        PubKey: accountInfo.pubKey,
        Sign: u8aToHex(key.sign(stringToU8a(msg))),
      };
    }

    const rq = {
      value: value,
      code: code,
      addresses: accountsRq,
      type: type,
    };

    const sign = createAuthPubKeyHeaderWithKeyAndTime(rq, authKey, time);
    const response = await fetch(`${apiUrl}/auth/signIn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Sign-Timestamp': String(time),
        Sign: sign,
        'Auth-Key': authPubKey,
      },
      body: JSON.stringify(rq),
    });

    if (response.ok) {
      const json = await response.json();
      await DB.setJWT(json.token);
    }
    return response.status;
  }

  export async function myMatchContacts(): Promise<Array<UserProfile>> {
    const jwt = await DB.getJWT();
    const response = await fetch(`${apiUrl}/profile/matchContacts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'BEARER ' + jwt,
      },
    });

    let json = [];
    if (response.status === 200) {
      json = await response.json();
    }
    if (json == null) {
      return [];
    }

    return json;
  }

  export async function myContacts(): Promise<Array<string>> {
    const jwt = await DB.getJWT();
    const response = await fetch(`${apiUrl}/profile/contacts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'BEARER ' + jwt,
      },
    });

    let json;
    if (response.status === 200) {
      json = await response.json();
    }
    if (json == null) {
      return [];
    }

    return json;
  }

  export async function updateContacts(
    contacts: Array<string>,
  ): Promise<boolean> {
    const jwt = await DB.getJWT();
    const response = await fetch(`${apiUrl}/profile/uploadContacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'BEARER ' + jwt,
      },
      body: JSON.stringify(contacts),
    });

    return response.status === 200;
  }

  export async function myProfile(): Promise<[number, MyProfile]> {
    const jwt = await DB.getJWT();
    const response = await fetch(`${apiUrl}/profile/my`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'BEARER ' + jwt,
      },
    });

    let json;
    if (response.status === 200) {
      json = await response.json();
    }
    return [response.status, json];
  }

  export async function uploadAvatar(
    base64: string,
    extension: string,
  ): Promise<number> {
    const formData = new FormData();
    formData.append('avatar', base64);
    formData.append('format', extension);

    const jwt = await DB.getJWT();
    const response = await fetch(`${apiUrl}/profile/uploadAvatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'BEARER ' + jwt,
      },
      body: formData,
    });

    return response.status;
  }

  export async function search(
    value: string,
    isEmail: boolean,
  ): Promise<Array<UserProfile>> {
    value = value.toLowerCase();
    if (value.length < 4) {
      return [];
    }
    const response = await fetch(
      `${apiUrl}/profile/search?value=${value}${isEmail ? '&type=email' : ''}`,
    );

    if (response.status !== 200) {
      return [];
    }
    return await response.json();
  }

  export async function getUserById(id: string): Promise<UserProfile | null> {
    const response = await fetch(`${apiUrl}/profile/info?id=${id}`);

    if (response.status !== 200) {
      return null;
    }

    const data: UserProfile = await response.json();
    return data;
  }

  export async function getUserByAddress(
    address: string,
  ): Promise<UserProfile | null> {
    if (
      timeForCache.has(address) &&
      timeForCache.get(address)! >= new Date().getTime()
    ) {
      console.log('user get from cache: ' + address);
      return userByAddressCache.get(address)!;
    }

    const response = await fetch(`${apiUrl}/profile/info?address=${address}`);

    if (response.status !== 200) {
      return null;
    }
    const data: UserProfile = await response.json();

    const polkadot = data.addresses[Currency.Polkadot];
    const kusama = data.addresses[Currency.Kusama];

    timeForCache.set(polkadot, new Date().getTime() + cacheTimeout);
    userByAddressCache.set(polkadot, data);

    timeForCache.set(kusama, new Date().getTime() + cacheTimeout);
    userByAddressCache.set(kusama, data);

    return data;
  }

  export async function isUsernameFree(username: string): Promise<boolean> {
    const response = await fetch(
      `${apiUrl}/profile/username?username=${username}`,
    );

    return response.status === 404;
  }

  export async function updateProfile(
    name: string,
    username: string,
  ): Promise<boolean> {
    const jwt = await DB.getJWT();
    const response = await fetch(`${apiUrl}/profile/updateProfile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'BEARER ' + jwt,
      },
      body: JSON.stringify({
        username: username,
        name: name,
      }),
    });

    return response.status === 200;
  }

  export async function setUsername(username: string): Promise<number> {
    const response = await fetch(
      `${apiUrl}/profile/username?username=${username}`,
    );

    return response.status;
  }

  export async function getLocal(): Promise<string> {
    let url = 'http://ip-api.com/json/';
    const response = await fetch(url);
    const json = await response.json();
    return json.countryCode;
  }

  export function getImgUrl(
    id: string,
    ex: string,
    lastUpdate: number,
  ): string {
    return `${apiUrl}/profile/avatar/${id}` + '#' + lastUpdate;
  }

  function createAuthPubKeyHeaderWithKeyAndTime(
    rq: any,
    key: KeyringPair,
    time: number,
  ): string {
    const msg = authMsg + JSON.stringify(rq) + time;
    return u8aToHex(key.sign(stringToU8a(msg)));
  }
}
export default BackendApi;
