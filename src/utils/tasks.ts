import React from 'react';
import BackgroundTimer from 'react-native-background-timer';
import db from 'utils/db';
import * as polkadot from 'utils/polkadot';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/Prices';
import {getSymbol} from 'models/wallet';
import {Account} from 'models/account';
import messaging from '@react-native-firebase/messaging';
import BackendApi from './backend';

/**
 * @namespace
 * @category Utils
 */
namespace Task {
  const sec = 1000;
  const min = 60 * sec;

  export async function initAccounts(accountDispatch: React.Dispatch<any>) {
    const accountsAddress = await db.getAccounts();

    if (accountsAddress == null || accountsAddress.length == 0) {
      throw 'accounts not found';
    }
    for (let i = 0; i < accountsAddress?.length; i++) {
      const account = await db.getAccountInfo(accountsAddress[i]);

      if (account == null) {
        continue;
      }
      accountDispatch(AccountsStore.addAccount(account));
    }
  }

  export async function createTask(
    accountDispatch: React.Dispatch<any>,
    pricesDispatch: React.Dispatch<any>,
  ) {
    console.log('start create task');
    const accountsAddress = await db.getAccounts();

    if (accountsAddress == null || accountsAddress.length == 0) {
      throw 'accounts not found';
    }

    const tasks = new Array<Promise<void>>();
    tasks.push(updateFirebaseToken());

    for (let i = 0; i < accountsAddress?.length; i++) {
      tasks.push(
        initAccount(accountsAddress[i], accountDispatch, pricesDispatch),
      );
    }

    for (let i = 0; i < tasks.length; i++) {
      await tasks[i];
    }
  }

  async function initAccount(
    address: string,
    accountDispatch: React.Dispatch<any>,
    pricesDispatch: React.Dispatch<any>,
  ) {
    const account = await db.getAccountInfo(address);

    if (account == null) {
      return;
    }

    const api = polkadot.Api.getInstance(account.currency);

    const balanceTask = updateBalance(api, accountDispatch, account);
    const priceTask = updatePrice(pricesDispatch, account);

    BackgroundTimer.setInterval(async () => {
      await updateBalance(api, accountDispatch, account);
    }, 10 * sec);

    BackgroundTimer.setInterval(async () => {
      await updatePrice(pricesDispatch, account);
    }, 5 * min);

    await balanceTask;
    await priceTask;
  }

  async function updateFirebaseToken() {
    try {
      let token = await db.getFirebaseToken();
      if (token == null || true) {
        token = await messaging().getToken();
        const ok = await BackendApi.setToken(token);
        if (ok) {
          await db.setFirebaseToken(token);
        }
      }
      messaging().onTokenRefresh(async (token: string) => {
        const ok = await BackendApi.setToken(token);
        if (ok) {
          await db.setFirebaseToken(token);
        }
      });
    } catch (e) {
      console.log('update firebase token err: ' + e);
    }
  }

  async function updateBalance(
    api: polkadot.Api,
    accountDispatch: React.Dispatch<any>,
    account: Account,
  ) {
    const balance = await api.balance(account.address);
    if (account.balance != balance && balance != null) {
      account.balance = balance;
      accountDispatch(
        AccountsStore.updateBalance(account.currency, account.balance),
      );
      await db.setAccountInfo(account);
    }
  }

  async function updatePrice(
    pricesDispatch: React.Dispatch<any>,
    account: Account,
  ) {
    const symbol = getSymbol(account.currency);
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`,
    );
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    pricesDispatch(PricesStore.updatePrice(account.currency, data.price));
  }
}

export default Task;
