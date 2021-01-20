import BackgroundTimer from 'react-native-background-timer';
import db from 'storage/DB';
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
import GlobalStore from 'storage/Global';
import ChatsStore from 'storage/Chats';
import DB from 'storage/DB';
import backend from './backend';

/**
 * @namespace
 * @category Utils
 */
namespace Task {
  const sec = 1000;
  const min = 60 * sec;
  const maxSyncTxs = 1000;

  export async function init(
    globalContext: GlobalStore.ContextType,
    accountContext: AccountsStore.ContextType,
    pricesContext: PricesStore.ContextType,
    chatsContext: ChatsStore.ContextType,
    transactionsContext: TransactionsStore.ContextType,
  ) {
    const accountsAddress = await db.getAccounts();
    if (accountsAddress == null || accountsAddress.length === 0) {
      throw 'accounts not found';
    }

    for (let i = 0; i < accountsAddress?.length; i++) {
      const account = await db.getAccountInfo(accountsAddress[i]);

      if (account == null) {
        continue;
      }
      accountContext.dispatch(AccountsStore.addAccount(account));

      const price = await db.getPrice(account.currency);
      pricesContext.dispatch(PricesStore.set(account.currency, price));

      const txs = await db.getTxs(account.currency);
      if (txs == null) {
        continue;
      }
      transactionsContext.dispatch(
        TransactionsStore.setTxs(account.currency, txs),
      );
    }

    const chatInfo = await db.getChatsInfo();
    const allChats = new Map<string, Map<string, Transaction>>();
    for (let key of chatInfo.keys()) {
      allChats.set(key, await db.getChat(key));
      chatsContext.dispatch(ChatsStore.set(allChats, chatInfo));
    }

    const authInfo = await DB.getAuthInfo();
    const notificationCount = await DB.getNotificationCount();
    const profile = await DB.getProfile();
    const jwt = await backend.getJWT();
    globalContext.dispatch(
      GlobalStore.set(
        profile != null ? profile : GlobalStore.initialState.profile,
        notificationCount,
        authInfo ?? GlobalStore.initialState.authInfo,
        true,
        jwt != null,
        jwt != null,
      ),
    );
  }

  export async function createTask(
    accountsContext: AccountsStore.ContextType,
    pricesContext: PricesStore.ContextType,
    globalContext: GlobalStore.ContextType,
    chatsContext: ChatsStore.ContextType,
    transactionsContext: TransactionsStore.ContextType,
  ) {
    console.log('start create task');

    if (accountsContext.state == null || accountsContext.state.size === 0) {
      throw 'accounts not found';
    }

    const tasks = new Array<Promise<void>>();

    tasks.push(updateBalances(accountsContext));
    tasks.push(updatePrices(pricesContext, accountsContext));

    BackgroundTimer.setInterval(async () => {
      await updatePrices(pricesContext, accountsContext);
    }, 1 * min);

    sync(accountsContext, globalContext, chatsContext, transactionsContext);
    BackgroundTimer.setInterval(async () => {
      await updateBalances(accountsContext);

      if (!globalContext.state.authInfo.isSynced) {
        return;
      }
      await sync(
        accountsContext,
        globalContext,
        chatsContext,
        transactionsContext,
      );
    }, 10 * sec);

    for (let i = 0; i < tasks.length; i++) {
      await tasks[i];
    }
  }

  export async function initPrivateData(
    accountsContext: AccountsStore.ContextType,
  ) {
    console.log('init private data');

    if (accountsContext.state == null || accountsContext.state.size === 0) {
      throw 'accounts not found';
    }

    const uFirebase = updateFirebaseToken();
    await backend.getJWT();
    await uFirebase;
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

  async function syncByAccount(
    account: Account,
    isSynced: boolean,
    globalContext: GlobalStore.ContextType,
    chatsContext: ChatsStore.ContextType,
    transactionsContext: TransactionsStore.ContextType,
  ) {
    const api = polkadot.Api.getInstance(account.currency);

    let size = 25;
    let txCount = 0;
    let page = 0;

    let isExistInDB = false;

    let chatsInfo = chatsContext.state.chatsInfo;

    let existedTxs = transactionsContext.state.get(account.currency);
    if (existedTxs === undefined) {
      existedTxs = new Map<string, Transaction>();
    }

    do {
      let txs = await api.getTransactionsWithoutUSDValue(
        account.address,
        page,
        size,
      );
      if (txs.length === 0) {
        break;
      }

      for (let i = 0; i < txs.length; i++) {
        if (txs[i].status === TxStatus.Fail) {
          continue;
        }

        if (existedTxs.has(txs[i].id) && isSynced) {
          isExistInDB = true;
          break;
        }

        await api.updateUSDValueInTransaction(txs[i]);
        transactionsContext.dispatch(
          TransactionsStore.addTx(account.currency, txs[i]),
        );

        let chatTxs = chatsContext.state.chats.get(txs[i].member);
        if (chatTxs === undefined) {
          chatTxs = new Map<string, Transaction>();
        }

        if (chatTxs.has(txs[i].id)) {
          continue;
        }

        let chatInfo;
        if (chatsInfo?.has(txs[i].member)) {
          chatInfo = chatsContext.state.chatsInfo.get(txs[i].member);
        } else {
          chatInfo = new ChatInfo(
            txs[i].member,
            txs[i].id,
            0,
            txs[i].timestamp,
            txs[i].currency,
          );
        }

        if (chatInfo == undefined) {
          console.log('warn: chat info is undefined');
          continue;
        }

        if (
          existedTxs.has(chatInfo.lastTxId) &&
          txs[i].timestamp > existedTxs.get(chatInfo.lastTxId)?.timestamp!
        ) {
          chatInfo.lastTxId = txs[i].id;
          chatInfo.currency = txs[i].currency;
          chatInfo.addressOrName = txs[i].member;
          chatInfo.timestamp = txs[i].timestamp;
        }

        if (isSynced) {
          chatInfo.notificationCount++;
        }

        chatsContext.dispatch(ChatsStore.setChatInfo(txs[i].member, chatInfo));
        chatsContext.dispatch(ChatsStore.addTxInChat(txs[i].member, txs[i]));
        if (isSynced) {
          globalContext.dispatch(GlobalStore.addNotificationCount());
        }
      }

      txCount = txs.length;
      page++;

      if (existedTxs.size > maxSyncTxs && !isSynced) {
        break;
      }
    } while (txCount === size && !isExistInDB);
  }

  async function sync(
    accountsContext: AccountsStore.ContextType,
    globalContext: GlobalStore.ContextType,
    chatsContext: ChatsStore.ContextType,
    transactionsContext: TransactionsStore.ContextType,
  ) {
    for (let value of accountsContext.state.values()) {
      await syncByAccount(
        value,
        globalContext.state.authInfo.isSynced,
        globalContext,
        chatsContext,
        transactionsContext,
      );
    }

    if (!globalContext.state.authInfo.isSynced) {
      await globalContext.dispatch(GlobalStore.setSynced());
    }
  }

  async function updateBalances(accountContext: AccountsStore.ContextType) {
    for (let value of accountContext.state.values()) {
      const api = polkadot.Api.getInstance(value.currency);

      const balance = await api.balance(value.address);
      if (value.balance != balance && balance != null) {
        value.balance = balance;
        accountContext.dispatch(
          AccountsStore.updateBalance(value.currency, value.balance),
        );
      }
    }
  }

  async function updatePrices(
    pricesContext: PricesStore.ContextType,
    accountContext: AccountsStore.ContextType,
  ) {
    for (let value of accountContext.state.values()) {
      const symbol = getSymbol(value.currency);
      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`,
      );
      if (!response.ok) {
        return;
      }

      const data = await response.json();
      pricesContext.dispatch(
        PricesStore.updatePrice(value.currency, data.price),
      );
    }
  }
}

export default Task;
