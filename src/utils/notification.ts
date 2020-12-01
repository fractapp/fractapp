import DB from "./db";
import { Keyring } from '@polkadot/api';
import { stringToU8a, u8aToHex } from "@polkadot/util";
import { bool } from "@polkadot/types";
import { Currency } from "models/wallet";
/**
 * @namespace
   * @category Utils
*/
namespace NotificationApi {
    enum Network {
        Polkadot = 0,
        Kusama
    }
    const apiUrl = "http://192.168.0.106:9544"
    const signMsg = "It is my firebase token for fractapp:"

    export async function setToken(token: string): Promise<boolean> {
        const accounts = await DB.getAccounts()
        const seed = await DB.getSeed()

        if (accounts == null || seed == null)
            return false

        let key = new Keyring({ type: "sr25519" }).addFromUri(seed)
        let ok = true
        for (let account of accounts) {
            const accountInfo = await DB.getAccountInfo(account)
            const time = Math.round((new Date()).getTime() / 1000)
            const msg = signMsg + token + time

            let network = Network.Polkadot
            switch (accountInfo.currency) {
                case Currency.Polkadot:
                    network = Network.Polkadot
                    break
                case Currency.Kusama:
                    network = Network.Kusama
                    break
            }
            const response = await fetch(`${apiUrl}/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    pubKey: accountInfo.pubKey,
                    address: accountInfo.address,
                    network: network,
                    sign: u8aToHex(key.sign(stringToU8a(msg))),
                    token: token,
                    time: time
                })
            });

            if (!response.ok) ok = response.ok;
        }

        return ok
    }

}

export default NotificationApi