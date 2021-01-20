import DB from 'storage/DB';
import {Keyring} from '@polkadot/keyring';
import {stringToU8a, u8aToHex} from '@polkadot/util';
import {Currency} from 'models/wallet';
// @ts-ignore
import {FRACTAPP_API} from '@env';
import {KeyringPair} from '@polkadot/keyring/types';
import {MyProfile} from 'models/myProfile';

/**
 * @namespace
 * @category Utils
 */
namespace BackendApi {
  export enum CheckType {
    Auth = 0,
    Change,
  }
  enum Network {
    Polkadot = 0,
    Kusama,
  }
  export enum CodeType {
    Phone = 0,
    Email,
  }

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
  ): Promise<[number, string]> {
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

    return [response.status, await response.text()];
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

    const json = await response.json();
    await DB.setJWT(json.token);
    return response.status;
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

  export async function search(value: string): Promise<Array<any>> {
    value = value.toLowerCase();
    if (value.length < 4) {
      return [];
    }
    const response = await fetch(`${apiUrl}/profile/search?value=${value}`);

    if (response.status !== 200) {
      return [];
    }
    return await response.json();
  }

  export async function isUsernameFree(username: string): Promise<boolean> {
    const response = await fetch(
      `${apiUrl}/profile/username?username=${username}`,
    );

    console.log(response.status);
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

    console.log(response.status);

    return response.status;
  }

  export function getImgUrl(
    id: string,
    ex: string,
    lastUpdate: number,
  ): string {
    return `${apiUrl}/${id}.${ex}` + '#' + lastUpdate;
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
