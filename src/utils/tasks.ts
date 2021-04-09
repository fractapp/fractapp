import BackgroundTimer from 'react-native-background-timer';
import DB from 'storage/DB';
import backend from 'utils/backend';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/Prices';
import {Currency} from 'types/wallet';
import {Account} from 'types/account';
import {Transaction, TxStatus} from 'types/transaction';
import TransactionsStore from 'storage/Transactions';
import {ChatInfo, ChatType} from 'types/chatInfo';
import GlobalStore from 'storage/Global';
import ChatsStore from 'storage/Chats';
import BN from 'bn.js';
import {Adaptors} from 'adaptors/adaptor';
import math from 'utils/math';

/**
 * @namespace
 * @category Utils
 */
namespace Task {
  const sec = 1000;
  const min = 60 * sec;

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
      throw new Error('accounts not found');
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
    const urls = await DB.getSubstrateUrls();

    globalContext.dispatch(
      GlobalStore.set(
        profile != null ? profile : GlobalStore.initialState().profile,
        notificationCount,
        authInfo ?? GlobalStore.initialState().authInfo,
        profile != null,
        profile != null,
        contacts,
        users,
        urls,
      ),
    );
    Adaptors.init(globalContext);
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
      throw new Error('accounts not found');
    }

    const tasks = new Array<Promise<void>>();

    tasks.push(updateBalances(globalContext, accountsContext));
    tasks.push(updateServerInfo(globalContext, pricesContext));

    BackgroundTimer.setInterval(async () => {
      await updateServerInfo(globalContext, pricesContext);
    }, min);

    sync(accountsContext, globalContext, chatsContext, transactionsContext);
    checkPendingTxs(transactionsContext);

    BackgroundTimer.setInterval(async () => {
      await updateBalances(globalContext, accountsContext);

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
    } catch (e) {
      console.log('user not found: ' + e);
    }

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
    await backend.getJWT();
  }

  export async function syncByAccount(
    account: Account,
    isSynced: boolean,
    globalContext: GlobalStore.ContextType,
    chatsContext: ChatsStore.ContextType,
    transactionsContext: TransactionsStore.ContextType,
  ) {
    let existedTxs = transactionsContext.state.transactions.get(
      account.currency,
    );
    if (existedTxs === undefined) {
      existedTxs = new Map<string, Transaction>();
    }

    let txs = await backend.getTransactions(
      account.address,
      account.network,
      account.currency,
    );

    if (txs.length === 0) {
      return;
    }

    for (let i = 0; i < txs.length; i++) {
      if (txs[i].status === TxStatus.Fail) {
        continue;
      }

      if (existedTxs.has(txs[i].id) && isSynced) {
        return;
      }

      await setTx(
        globalContext,
        chatsContext,
        transactionsContext,
        txs[i],
        isSynced,
      );
    }
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
        const status = await backend.getTxStatus(value[i]);
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
    globalContext: GlobalStore.ContextType,
    accountsContext: AccountsStore.ContextType,
  ) {
    for (let account of accountsContext.state.accounts.values()) {
      const api = Adaptors.get(account.network);
      const planks = await api.balance(account.address);
      if (planks == null) {
        continue;
      }

      const viewBalance = math.convertFromPlanckToViewDecimals(
        planks,
        api.decimals,
        api.viewDecimals,
      );
      if (new BN(account.planks).cmp(planks) !== 0) {
        account.balance = viewBalance;
        account.planks = planks.toString();

        accountsContext.dispatch(
          AccountsStore.updateBalance(
            account.currency,
            account.balance,
            account.planks,
          ),
        );
      }
    }
  }

  export async function updateServerInfo(
    globalContext: GlobalStore.ContextType,
    pricesContext: PricesStore.ContextType,
  ) {
    const info = await backend.getInfo();
    if (info == null) {
      return;
    }

    for (let url of info.substrateUrls) {
      globalContext.dispatch(GlobalStore.setSubstrateUrl(url.network, url.url));
    }

    for (let priceInfo of info.prices) {
      pricesContext.dispatch(
        PricesStore.updatePrice(priceInfo.currency, priceInfo.value),
      );
    }
  }
}

export default Task;
