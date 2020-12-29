import DB from './db';
import {Keyring} from '@polkadot/api';
import {stringToU8a, u8aToHex} from '@polkadot/util';
import {Currency} from 'models/wallet';
/**
 * @namespace
 * @category Utils
 */
namespace BackendApi {
  enum Network {
    Polkadot = 0,
    Kusama,
  }
  const apiUrl = 'http://192.168.0.101:9544';
  const signMsg = 'It is my firebase token for fractapp:';
  export const CodeLength = 6;
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
      const msg = signMsg + token + time;

      let network = Network.Polkadot;
      switch (accountInfo.currency) {
        case Currency.Polkadot:
          network = Network.Polkadot;
          break;
        case Currency.Kusama:
          network = Network.Kusama;
          break;
      }
      const response = await fetch(`${apiUrl}/subscribe`, {
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
          time: time,
        }),
      });

      if (!response.ok) {
        ok = response.ok;
      }
    }

    return ok;
  }

  export async function sendSMS(phone: string): Promise<[number, string]> {
    const response = await fetch(`${apiUrl}/registration?number=${phone}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return [response.status, await response.text()];
  }
}

export default BackendApi;
