import DB from 'storage/DB';
import {Keyring} from '@polkadot/keyring';
import {stringToU8a, u8aToHex} from '@polkadot/util';
import {Currency} from 'types/wallet';
import {Network} from 'types/account';

// @ts-ignore
import {FRACTAPP_API} from '@env';
import {KeyringPair} from '@polkadot/keyring/types';
import {MyProfile} from 'types/myProfile';
import {UserProfile} from 'types/profile';
import {Transaction, TxStatus, TxType} from 'types/transaction';
import BN from 'bn.js';
import MathUtils from 'utils/math';
import {ServerInfo} from 'types/serverInfo';
import {Adaptors} from 'adaptors/adaptor';
import math from 'utils/math';

/**
 * @namespace
 * @category Utils
 */
namespace BackendApi {
  export enum CheckType {
    Auth = 0,
    Change,
  }
  export enum CodeType {
    Phone = 0,
    Email,
  }

  const cacheTimeout = 36000000; // 10 minutes

  let userById = new Map<string, UserProfile>();
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
      const accountInfo = (await DB.getAccountInfo(account))!;

      const time = Math.round(new Date().getTime() / 1000);
      const msg = signTokenMsg + token + time;
      let network = Network.Polkadot;
      switch (accountInfo.currency) {
        case Currency.DOT:
          network = Network.Polkadot;
          break;
        case Currency.KSM:
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

      console.log(response.text());

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

  function createAuthPubKeyHeaderWithKeyAndTime(
    rq: any,
    key: KeyringPair,
    time: number,
  ): string {
    const msg = authMsg + JSON.stringify(rq) + time;
    return u8aToHex(key.sign(stringToU8a(msg)));
  }

  export async function getInfo(): Promise<ServerInfo | null> {
    const response = await fetch(`${apiUrl}/info/total`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      return await response.json();
    } else {
      return null;
    }
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

  export async function search(value: string): Promise<Array<UserProfile>> {
    value = value.toLowerCase().trim();
    if (value.startsWith('@')) {
      value = value.substring(1);
    }

    if (value.length < 4) {
      return [];
    }
    const response = await fetch(`${apiUrl}/profile/search?value=${value}`);

    if (response.status !== 200) {
      return [];
    }
    return await response.json();
  }

  export async function getUserById(
    id: string,
  ): Promise<UserProfile | null | undefined> {
    if (timeForCache.has(id) && timeForCache.get(id)! >= new Date().getTime()) {
      console.log('user get from cache: ' + id);
      return userById.get(id)!;
    }

    const response = await fetch(`${apiUrl}/profile/userInfo?id=${id}`);

    console.log('get user status: ' + response.status);
    if (response.status === 404) {
      return undefined;
    } else if (response.status !== 200) {
      return null;
    }
    const data: UserProfile = await response.json();

    timeForCache.set(id, new Date().getTime() + cacheTimeout);
    userById.set(id, data);

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

  export async function getLocalByIp(): Promise<string> {
    let url = 'http://ip-api.com/json/';
    const response = await fetch(url);
    const json = await response.json();
    return json.countryCode;
  }

  export async function getTransactions(
    address: string,
    network: Network,
    currency: Currency,
  ): Promise<Array<Transaction>> {
    let transactions = new Array<Transaction>();
    const api = Adaptors.get(network);

    let rs = await fetch(
      `${apiUrl}/profile/transactions?address=${address}&currency=${currency}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (!rs.ok) {
      throw new Error('invalid get txs (status != 200)');
    }

    const data = await rs.json();
    if (data == null || data.length === 0) {
      return new Array<Transaction>();
    }

    for (let i = 0; i < data.length; i++) {
      const tx = data[i];

      let txType = 0;
      let member = '';

      let userId = null;
      if (address === tx.from) {
        txType = TxType.Sent;
        member = tx.to;
        if (tx.userTo !== '') {
          userId = tx.userTo;
        }
      } else {
        txType = TxType.Received;
        member = tx.from;
        if (tx.userFrom !== '') {
          userId = tx.userFrom;
        }
      }
      transactions.push({
        id: tx.id,
        userId: userId,
        address: member,
        currency: currency,
        txType: txType,
        timestamp: tx.timestamp,

        value: math.convertFromPlanckToViewDecimals(
          new BN(tx.value, 10),
          api.decimals,
          api.viewDecimals,
        ),
        planckValue: tx.value,
        usdValue: MathUtils.floorUsd(tx.usdValue),

        fee: math.convertFromPlanckToViewDecimals(
          new BN(tx.fee, 10),
          api.decimals,
          api.viewDecimals,
        ),
        planckFee: tx.fee,
        usdFee: MathUtils.floorUsd(tx.usdFee),
        status: tx.status,
      });
    }

    return transactions;
  }

  export async function getTxStatus(hash: string): Promise<TxStatus | null> {
    let rs = await fetch(`${apiUrl}/profile/transaction/status?hash=${hash}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!rs.ok) {
      return null;
    }

    const data = await rs.json();
    return data.status;
  }

  export async function substrateBalance(
    address: string,
    currency: Currency,
  ): Promise<BN | null> {
    let rs = await fetch(
      `${apiUrl}/profile/substrate/balance?address=${address}&currency=${currency}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (!rs.ok) {
      return null;
    }

    const balance = await rs.json();
    return new BN(balance.value);
  }

  export function getImgUrl(id: string, lastUpdate: number): string {
    return `${apiUrl}/profile/avatar/${id}` + '#' + lastUpdate;
  }
}
export default BackendApi;
