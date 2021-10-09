import DB from 'storage/DB';
import { Keyring } from '@polkadot/keyring';
import { stringToU8a, u8aToHex } from '@polkadot/util';
import { Currency } from 'types/wallet';
import { AccountType, BalanceRs, Network } from 'types/account';
// @ts-ignore
import { FRACTAPP_API } from '@env';
import { KeyringPair } from '@polkadot/keyring/types';
import { Adaptors } from 'adaptors/adaptor';
import { MyProfile } from 'types/myProfile';
import { Profile } from 'types/profile';
import { ApiTransaction, Transaction, TxAction, TxStatus, TxType } from 'types/transaction';
import BN from 'bn.js';
import MathUtils from 'utils/math';
import math from 'utils/math';
import { FeeInfo, ServerInfo, SubstrateBase, SubstrateTxBase } from 'types/serverInfo';
import { MessageRq, UndeliveredMessagesInfo } from 'types/message';

/**
 * @namespace
 * @category Utils
 */
namespace BackendApi {
  export enum CodeType {
    Phone = 0,
    Email,
    CryptoAddress
  }

  const cacheTimeout = 36000000; // 10 minutes

  let userById = new Map<string, Profile>();
  let timeForCache = new Map<string, number>();

  const apiUrl = FRACTAPP_API;
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
    const jwt = await DB.getJWT();
    const response = await fetch(`${apiUrl}/profile/firebase/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'BEARER ' + jwt,
      },
      body: JSON.stringify({
        token: token,
      }),
    });

    return response.status === 200;
  }

  export async function sendCode(
    value: string,
    type: CodeType,
  ): Promise<number> {
    const response = await fetch(`${apiUrl}/auth/sendCode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: type,
        value: value,
      }),
    });

    return response.status;
  }

  export async function auth(
    type: CodeType,
    value: string = '',
    code: string = ''
  ): Promise<number> {
    const seed = await DB.getSeed();

    const accounts = (await DB.getAccountStore())?.accounts[AccountType.Main];
    if (accounts == null || seed == null) {
      return 400;
    }

    let key = new Keyring({ type: 'sr25519' }).addFromUri(seed);

    let authKey = new Keyring({ type: 'sr25519' }).addFromUri(seed + '//auth');

    let accountsRq = {};
    const time = Math.round(new Date().getTime() / 1000);
    const authPubKey = u8aToHex(authKey.publicKey);
    for (let keyValue of Object.entries(accounts)) {
      const account = keyValue[1];
      const msg = signAddressMsg + authPubKey + time;
      // @ts-ignore
      accountsRq[account.currency] = {
        Address: account.address,
        PubKey: account.pubKey,
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
    const tasks = Promise.race([
      fetch(`${apiUrl}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Sign-Timestamp': String(time),
          Sign: sign,
          'Auth-Key': authPubKey,
        },
        body: JSON.stringify(rq),
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ]);

    const response: any = await tasks;

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

  export async function myMatchContacts(): Promise<Array<Profile>> {
    const jwt = await DB.getJWT();
    const response = await fetch(`${apiUrl}/profile/matchContacts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'BEARER ' + jwt,
      },
    });

    let users = [];
    if (response.status === 200) {
      users = await response.json();
    }
    if (users == null) {
      return [];
    }

    return users;
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

  export async function search(value: string): Promise<Array<Profile>> {
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


    const users = await response.json();

    return users;
  }

  export async function getUserById(
    id: string,
  ): Promise<Profile | null | undefined> {
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
    const user: Profile = await response.json();

    timeForCache.set(id, new Date().getTime() + cacheTimeout);
    userById.set(id, user);

    return user;
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
    let transactions: Array<Transaction> = [];
    const api = Adaptors.get(network)!;

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
      const tx: ApiTransaction = data[i];

      let txType = 0;
      let member = '';

      let userId = null;
      if (tx.action === TxAction.StakingWithdrawn) {
        txType = TxType.Received;
        member = tx.to;
        if (tx.userTo !== '') {
          userId = tx.userTo;
        }
      } else if (tx.action === TxAction.StakingReward) {
        txType = TxType.Received;
        member = tx.to;
        if (tx.userTo !== '') {
          userId = tx.userTo;
        }
      } else if (address === tx.from) {
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
        hash: tx.hash,
        userId: userId,
        address: member,
        currency: currency,
        action: tx.action,
        txType: txType,
        timestamp: tx.timestamp,

        value: math.convertFromPlanckToViewDecimals(
          new BN(tx.value, 10),
          api.decimals,
          api.viewDecimals,
        ),
        planckValue: tx.value,
        usdValue: math.calculateUsdValue(
          new BN(tx.value, 10),
          api.decimals,
          api.viewDecimals,
        ),
        fullValue: math.convertFromPlanckToString(
          new BN(tx.value),
          api.decimals
        ),
        fee: math.convertFromPlanckToViewDecimals(
          new BN(tx.fee, 10),
          api.decimals,
          api.viewDecimals,
        ),
        planckFee: tx.fee,
        usdFee:  math.calculateUsdValue(
          new BN(tx.fee, 10),
          api.decimals,
          api.viewDecimals,
        ),
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
  ): Promise<BalanceRs | null> {
    let rs = await fetch(
      `${apiUrl}/substrate/balance?address=${address}&currency=${currency}`,
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
    return balance;
  }

  export function getImgUrl(id: string, lastUpdate: number): string {
    return `${apiUrl}/profile/avatar/${id}` + '#' + lastUpdate;
  }

  export async function getUnreadMessages(): Promise<UndeliveredMessagesInfo | null> {
    const jwt = await DB.getJWT();
    const response = await fetch(`${apiUrl}/message/unread`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'BEARER ' + jwt,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  }

  export async function setRead(readMsgs: Array<string>): Promise<boolean> {
    const jwt = await DB.getJWT();
    const response = await fetch(`${apiUrl}/message/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'BEARER ' + jwt,
      },
      body: JSON.stringify(readMsgs),
    });

    return response.ok;
  }

  export async function sendMsg(msg: MessageRq): Promise<number | null> {
    const jwt = await DB.getJWT();
    const response = await fetch(`${apiUrl}/message/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'BEARER ' + jwt,
      },
      body: JSON.stringify(msg),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()).timestamp;
  }

  export async function calculateSubstrateFee(
    tx: string,
    network: Network,
  ): Promise<FeeInfo | null> {
    let response = await fetch(
      `${apiUrl}/substrate/fee?tx=${tx}&network=${network}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.ok) {
      return await response.json();
    } else {
      return null;
    }
  }

  export async function getSubstrateBase(
    network: Network,
  ): Promise<SubstrateBase | null> {
    let response = await fetch(
      `${apiUrl}/substrate/base?network=${network}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.ok) {
      return await response.json();
    } else {
      return null;
    }
  }

  export async function getSubstrateTxBase(
    sender: string,
    network: Network,
  ): Promise<SubstrateTxBase | null> {
    let response = await fetch(
      `${apiUrl}/substrate/txBase?sender=${sender}&network=${network}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.ok) {
      return await response.json();
    } else {
      return null;
    }
  }

  export async function broadcastSubstrateTx(
    tx: string,
    network: Network,
  ): Promise<string | null> {
    let response = await fetch(
      `${apiUrl}/substrate/broadcast?tx=${tx}&network=${network}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.ok) {
      const info = await response.json();
      return info.hash;
    } else {
      return null;
    }
  }
}
export default BackendApi;
