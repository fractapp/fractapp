import BackgroundTimer from 'react-native-background-timer';
import db from 'utils/db'
import * as polkadot from 'utils/polkadot'
import AccountsStore from 'storage/Accounts'
import PricesStore from 'storage/Prices'
import { getSymbol } from 'models/wallet';
import { Account } from 'models/account';
import messaging from '@react-native-firebase/messaging';

/**
 * @namespace
   * @category Utils
*/
namespace Task {
    const sec = 1000
    const min = 60 * sec
    export const createTask = async (accountDispatch: React.Dispatch<any>, pricesDispatch: React.Dispatch<any>) => {
        const accountsAddress = await db.getAccounts()

        if (accountsAddress == null || accountsAddress.length == 0)
            throw ("accounts not found")

        for (let i = 0; i < accountsAddress?.length; i++) {
            const account = await db.getAccountInfo(accountsAddress[i])
            const api = await polkadot.Api.getInstance(account.currency)
            accountDispatch(AccountsStore.addAccount(account))

            await updateBalance(api, accountDispatch, account)
            await updatePrice(pricesDispatch, account)

            BackgroundTimer.runBackgroundTimer(async () => {
                await updateBalance(api, accountDispatch, account)
            }, 10 * sec)

            await updatePrice(pricesDispatch, account)
            BackgroundTimer.runBackgroundTimer(async () => {
                await updatePrice(pricesDispatch, account)
            }, 5 * min)
        }
    }

    const updateFirebaseToken = () => {
        messaging()
            .getToken()
            .then(async token => {
                await db.setFirebaseToken(token);
                const tokenA = await db.getFirebaseToken()
                console.log(tokenA)
            });

        messaging().onTokenRefresh(token => {
            db.setFirebaseToken(token);
        });
    }

    const updateBalance = async (api: polkadot.Api, accountDispatch: React.Dispatch<any>, account: Account) => {
        const balance = await api.balance(account.address)
        if (account.balance != balance) {
            account.balance = balance
            accountDispatch(AccountsStore.updateBalance(account.currency, account.balance))
            await db.setAccountInfo(account)
        }
    }

    const updatePrice = async (pricesDispatch: React.Dispatch<any>, account: Account) => {
        const symbol = getSymbol(account.currency)
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`)
        if (!response.ok)
            return

        const data = await response.json()
        pricesDispatch(PricesStore.updatePrice(account.currency, data.price))
    }
}
export default Task