import BackgroundTimer from 'react-native-background-timer';
import DB from 'storage/DB';
import * as polkadot from 'utils/polkadot';
import backend from 'utils/backend';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/Prices';
import {Currency, getSymbol} from 'types/wallet';
import {Account} from 'types/account';
import messaging from '@react-native-firebase/messaging';
import {Transaction, TxStatus} from 'types/transaction';
import TransactionsStore from 'storage/Transactions';
import {ChatInfo, ChatType} from 'types/chatInfo';
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
  const maxSyncTxs = 100;

  export async function init(
    globalContext: GlobalStore.ContextType,
    accountsContext: AccountsStore.ContextType,
    pricesContext: PricesStore.ContextType,
    chatsContext: ChatsStore.ContextType,
    transactionsContext: TransactionsStore.ContextType,
  ) {
    const accounts = new Map<Currency, Account>();
    const totalTxs = new Map<Currency, Map<string, Transaction>>();
    const totalPendingTxs = new Map<Currency, Array<string>>();

    const accountsAddress = await DB.getAccounts();
    if (accountsAddress == null || accountsAddress.length === 0) {
      throw 'accounts not found';
    }
    for (let i = 0; i < accountsAddress?.length; i++) {
      const account = await DB.getAccountInfo(accountsAddress[i]);

      if (account == null) {
        continue;
      }
      accounts.set(account.currency, account);

      const price = await DB.getPrice(account.currency);
      pricesContext.dispatch(PricesStore.set(account.currency, price));

      const txs = await DB.getTxs(account.currency);
      totalTxs.set(account.currency, txs);

      const pendingTxs = await DB.getPendingTxs(account.currency);
      totalPendingTxs.set(account.currency, pendingTxs);
    }
    accountsContext.dispatch(AccountsStore.set(accounts));
    transactionsContext.dispatch(
      TransactionsStore.set(totalTxs, totalPendingTxs),
    );

    const chatsInfo = await DB.getChatsInfo();
    const allChats = new Map<string, Map<string, Currency>>();
    for (let key of chatsInfo.keys()) {
      allChats.set(key, await DB.getChat(key));
    }
    chatsContext.dispatch(ChatsStore.set(allChats, chatsInfo));

    const authInfo = await DB.getAuthInfo();
    const notificationCount = await DB.getNotificationCount();
    const profile = await DB.getProfile();
    const contacts = await DB.getContacts();
    const users = await DB.getUsers();

    globalContext.dispatch(
      GlobalStore.set(
        profile != null ? profile : GlobalStore.initialState.profile,
        notificationCount,
        authInfo ?? GlobalStore.initialState.authInfo,
        profile != null,
        profile != null,
        contacts,
        users,
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

    if (
      accountsContext.state.accounts == null ||
      accountsContext.state.accounts.size === 0
    ) {
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

    updateUsersList(globalContext);
    BackgroundTimer.setInterval(async () => {
      await updateUsersList(globalContext);
    }, 20 * min);

    for (let i = 0; i < tasks.length; i++) {
      await tasks[i];
    }

    console.log('end create task');
  }

  export async function setTx(
    globalContext: GlobalStore.ContextType,
    chatsContext: ChatsStore.ContextType,
    transactionsContext: TransactionsStore.ContextType,
    tx: Transaction,
    isNotify: boolean,
  ): Promise<ChatInfo> {
    let p = null;
    try {
      p = await backend.getUserByAddress(tx.address);
    } catch (e) {}

    let member = tx.address;
    if (p != null) {
      tx.userId = p.id;
      member = tx.userId;

      globalContext.dispatch(GlobalStore.setUser(p));
    }

    transactionsContext.dispatch(TransactionsStore.setTx(tx.currency, tx));

    let chatInfo: ChatInfo;
    if (chatsContext.state.chatsInfo.has(member)) {
      chatInfo = chatsContext.state.chatsInfo.get(member)!;
    } else {
      chatInfo = {
        id: member,
        name: p == null ? tx.address : p.name,
        lastTxId: tx.id,
        lastTxCurrency: tx.currency,
        notificationCount: 0,
        timestamp: tx.timestamp,
        type: p == null ? ChatType.AddressOnly : ChatType.Chat,
        details:
          p == null
            ? {
                currency: tx.currency,
                address: tx.address,
              }
            : null,
      };
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

    chatsContext.dispatch(ChatsStore.setChatInfo(chatInfo.id, chatInfo));
    chatsContext.dispatch(
      ChatsStore.addTxInChat(chatInfo.id, tx.id, tx.currency),
    );

    if (isNotify) {
      globalContext.dispatch(GlobalStore.addNotificationCount());
    }

    return chatInfo;
  }

  export async function initPrivateData() {
    console.log('init private data');

    const uFirebase = updateFirebaseToken();
    await backend.getJWT();

    await uFirebase;
  }

  export async function updateFirebaseToken() {
    try {
      let token = await DB.getFirebaseToken();
      if (token == null) {
        token = await messaging().getToken();
        const ok = await backend.setToken(token);
        if (ok) {
          await DB.setFirebaseToken(token);
        }
      }

      messaging().onTokenRefresh(async (token: string) => {
        const ok = await backend.setToken(token);
        if (ok) {
          await DB.setFirebaseToken(token);
        }
      });
    } catch (e) {
      console.log('update firebase token err: ' + e);
    }
  }

  export async function syncByAccount(
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

        if (isSynced) {
          await api.updateUSDValueInTransaction(txs[i]);
        }
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

  export async function sync(
    accountsContext: AccountsStore.ContextType,
    globalContext: GlobalStore.ContextType,
    chatsContext: ChatsStore.ContextType,
    transactionsContext: TransactionsStore.ContextType,
  ) {
    for (let value of accountsContext.state.accounts.values()) {
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

  export async function checkPendingTxs(
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

  export async function updateUsersList(
    globalContext: GlobalStore.ContextType,
  ) {
    for (let id of globalContext.state.users.keys()) {
      const user = await backend.getUserById(id);
      if (user == null) {
        globalContext.dispatch(GlobalStore.deleteUser(id));
        continue;
      }

      globalContext.dispatch(GlobalStore.setUser(user));
    }
  }

  export async function updateBalances(
    accountsContext: AccountsStore.ContextType,
  ) {
    for (let value of accountsContext.state.accounts.values()) {
      const api = await polkadot.Api.getInstance(value.currency);

      const balance = await api.balance(value.address);
      if (!balance) {
        continue;
      }

      const balanceValue = balance.value;
      const planks = balance.plankValue;

      if (value.planks === '' || new BN(value.planks).cmp(planks) !== 0) {
        value.balance = balanceValue;
        value.planks = planks.toString(10);

        accountsContext.dispatch(
          AccountsStore.updateBalance(
            value.currency,
            value.balance,
            value.planks,
          ),
        );
      }
    }
  }

  export async function updatePrices(
    pricesContext: PricesStore.ContextType,
    accountsContext: AccountsStore.ContextType,
  ) {
    for (let value of accountsContext.state.accounts.values()) {
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
