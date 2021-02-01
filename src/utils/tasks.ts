import BackgroundTimer from 'react-native-background-timer';
import db from 'storage/DB';
import DB from 'storage/DB';
import * as polkadot from 'utils/polkadot';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/Prices';
import {getSymbol} from 'models/wallet';
import {Account} from 'models/account';
import messaging from '@react-native-firebase/messaging';
import BackendApi from './backend';
import backend from './backend';
import {Transaction, TxStatus} from 'models/transaction';
import TransactionsStore from 'storage/Transactions';
import {ChatInfo, ChatType} from 'models/chatInfo';
import GlobalStore from 'storage/Global';
import ChatsStore from 'storage/Chats';
import BN from 'bn.js';

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
      const pendingTxs = await db.getPendingTxs(account.currency);
      console.log('DB ' + JSON.stringify(pendingTxs));
      transactionsContext.dispatch(
        TransactionsStore.setTxs(account.currency, txs, pendingTxs),
      );
    }

    const chatInfo = await db.getChatsInfo();
    const allChats = new Map<string, Map<string, boolean>>();
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
    }, min);

    sync(accountsContext, globalContext, chatsContext, transactionsContext);
    checkPendingTxs(transactionsContext);
    BackgroundTimer.setInterval(async () => {
      await updateBalances(accountsContext);

      if (!globalContext.state.authInfo.isSynced) {
        return;
      }

      await checkPendingTxs(transactionsContext);
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

  export async function setTx(
    globalContext: GlobalStore.ContextType,
    chatsContext: ChatsStore.ContextType,
    transactionsContext: TransactionsStore.ContextType,
    tx: Transaction,
    isNotify: boolean,
  ): Promise<ChatInfo> {
    transactionsContext.dispatch(TransactionsStore.setTx(tx.currency, tx));

    let chatInfo;
    if (chatsContext.state.chatsInfo.has(tx.member)) {
      chatInfo = chatsContext.state.chatsInfo.get(tx.member)!;
    } else {
      chatInfo = new ChatInfo(
        tx.member,
        tx.member,
        tx.id,
        tx.currency,
        0,
        tx.timestamp,
        ChatType.AddressOnly,
        {
          currency: tx.currency,
          address: tx.member,
        },
      );
    }

    if (
      tx.id !== chatInfo.lastTxId &&
      tx.timestamp >
        transactionsContext.state.transactions
          .get(chatInfo.lastTxCurrency)
          ?.get(chatInfo.lastTxId)?.timestamp!
    ) {
      chatInfo.lastTxId = tx.id;
      chatInfo.lastTxCurrency = tx.currency;
      chatInfo.timestamp = tx.timestamp;
    }

    if (isNotify) {
      chatInfo.notificationCount++;
    }

    chatsContext.dispatch(ChatsStore.setChatInfo(tx.member, chatInfo));
    chatsContext.dispatch(ChatsStore.addTxInChat(tx.member, tx.id));

    if (isNotify) {
      globalContext.dispatch(GlobalStore.addNotificationCount());
    }

    return chatInfo;
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
    const api = await polkadot.Api.getInstance(account.currency);

    let size = 25;
    let txCount = 0;
    let page = 0;

    let isExistInDB = false;

    let existedTxs = transactionsContext.state.transactions.get(
      account.currency,
    );
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
        await setTx(
          globalContext,
          chatsContext,
          transactionsContext,
          txs[i],
          isSynced,
        );
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

  async function checkPendingTxs(
    transactionsContext: TransactionsStore.ContextType,
  ) {
    for (let [currency, value] of transactionsContext.state
      .pendingTransactions) {
      for (let i = 0; i < value.length; i++) {
        const api = await polkadot.Api.getInstance(currency);

        const status = await api.getTxStatus(value[i]);
        if (status == null) {
          continue;
        }
        let tx = transactionsContext.state.transactions
          ?.get(currency)
          ?.get(value[i])!;

        tx.status = status!;
        transactionsContext.dispatch(TransactionsStore.setTx(currency, tx));
        transactionsContext.dispatch(
          TransactionsStore.removePendingTx(currency, i),
        );
      }
    }
  }

  async function updateBalances(accountContext: AccountsStore.ContextType) {
    for (let value of accountContext.state.values()) {
      const api = await polkadot.Api.getInstance(value.currency);

      const balance = await api.balance(value.address);
      if (!balance) {
        continue;
      }

      const balanceValue = balance[0];
      const planks = balance[1];

      if (value.planks === '' || new BN(value.planks).cmp(planks) !== 0) {
        value.balance = balanceValue;
        value.planks = planks.toString(10);

        accountContext.dispatch(
          AccountsStore.updateBalance(
            value.currency,
            value.balance,
            value.planks,
          ),
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
