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
import {Transaction, TxStatus} from 'models/transaction';
import TransactionsStore from 'storage/Transactions';
import {ChatInfo} from 'models/chatInfo';

/**
 * @namespace
 * @category Utils
 */
namespace Task {
  const sec = 1000;
  const min = 60 * sec;

  export async function init(
    accountDispatch: React.Dispatch<any>,
    transactionsDispatch: React.Dispatch<any>,
  ) {
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

      const txs = await db.getTxs(account.currency);
      if (txs == null) {
        continue;
      }
      transactionsDispatch(TransactionsStore.setTxs(account.currency, txs));
    }
  }

  export async function createTask(
    accountDispatch: React.Dispatch<any>,
    pricesDispatch: React.Dispatch<any>,
    transactionsDispatch: React.Dispatch<any>,
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
        initAccount(
          accountsAddress[i],
          accountDispatch,
          pricesDispatch,
          transactionsDispatch,
        ),
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
    transactionsDispatch: React.Dispatch<any>,
  ) {
    const account = await db.getAccountInfo(address);

    if (account == null) {
      return;
    }

    const api = polkadot.Api.getInstance(account.currency);

    const balanceTask = updateBalance(api, accountDispatch, account);
    const priceTask = updatePrice(pricesDispatch, account);

    updateTransactions(api, account, transactionsDispatch);
    BackgroundTimer.setInterval(async () => {
      await updateBalance(api, accountDispatch, account);
      await updateTransactions(api, account, transactionsDispatch);
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
      if (token == null) {
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

  async function updateTransactions(
    api: polkadot.Api,
    account: Account,
    transactionsDispatch: React.Dispatch<any>,
  ) {
    let size = 25;
    let txCount = 0;
    let page = 0;

    let chats = await db.getChats();
    if (chats == null) {
      chats = new Map<string, ChatInfo>();
    }

    let dbTxs = await db.getTxs(account.currency);
    if (dbTxs == null) {
      dbTxs = new Map<string, Transaction>();
    }

    const txsMap = new Map<string, Transaction>();
    let isExistInDB = false;
    do {
      let isAtLeastOne = false;

      let txs = await api.getTransactionsWithoutUSDValue(
        account.address,
        page,
        size,
      );
      if (txs.length == 0) {
        break;
      }

      for (let i = 0; i < txs.length; i++) {
        if (txs[i].status == TxStatus.Fail) {
          continue;
        }
        if (dbTxs?.has(txs[i].id)) {
          isExistInDB = true;
          break;
        }

        isAtLeastOne = true;
        await api.updateUSDValueInTransaction(txs[i]);

        const lastChatId = chats.get(txs[i].member).lastTxId;
        if (!chats?.has(txs[i].member)) {
          chats.set(
            txs[i].member,
            new ChatInfo(txs[i].member, txs[i].currency, txs[i].id, 0),
          );
        } else if (
          (txsMap.has(lastChatId) &&
            txs[i].timestamp > txsMap.get(lastChatId).timestamp) ||
          (dbTxs.has(lastChatId) &&
            txs[i].timestamp > dbTxs.get(lastChatId).timestamp)
        ) {
          chats.set(
            txs[i].member,
            new ChatInfo(txs[i].member, txs[i].currency, txs[i].id, 0),
          );
        }

        transactionsDispatch(TransactionsStore.addTx(account.currency, txs[i]));
        txsMap.set(txs[i].id, txs[i]);
      }

      txCount = txs.length;
      page++;
      if (!isAtLeastOne) {
        continue;
      }

      await db.setChats(chats);
      await db.addTxs(account.currency, txsMap);
    } while (txCount === size && !isExistInDB);
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
