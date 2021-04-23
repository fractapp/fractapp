import BackgroundTimer from 'react-native-background-timer';
import DB from 'storage/DB';
import backend from 'utils/backend';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/Prices';
import {Currency} from 'types/wallet';
import {Account} from 'types/account';
import {Transaction, TxStatus} from 'types/transaction';
import GlobalStore from 'storage/Global';
import ChatsStore from 'storage/Chats';
import BN from 'bn.js';
import {Adaptors} from 'adaptors/adaptor';
import math from 'utils/math';
import {UserProfile} from 'types/profile';

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
  ) {
    const accounts = new Map<Currency, Account>();

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
    }
    accountsContext.dispatch(AccountsStore.set(accounts));

    const chatsState = await DB.getChatsState();
    chatsState.isInitialized = true;
    chatsContext.dispatch(ChatsStore.set(chatsState));

    const authInfo = await DB.getAuthInfo();
    const profile = await DB.getProfile();
    const contacts = await DB.getContacts();
    const users = await DB.getUsers();
    const urls = await DB.getSubstrateUrls();

    globalContext.dispatch(
      GlobalStore.set(
        profile != null ? profile : GlobalStore.initialState().profile,
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

    sync(accountsContext, globalContext, chatsContext);
    checkPendingTxs(chatsContext);

    BackgroundTimer.setInterval(async () => {
      await updateBalances(globalContext, accountsContext);

      if (!globalContext.state.authInfo.isSynced) {
        return;
      }

      await checkPendingTxs(chatsContext);
      await sync(accountsContext, globalContext, chatsContext);
    }, 3 * sec);

    updateUsersList(globalContext, chatsContext);
    BackgroundTimer.setInterval(async () => {
      await updateUsersList(globalContext, chatsContext);
    }, 20 * min);

    for (let i = 0; i < tasks.length; i++) {
      await tasks[i];
    }

    console.log('end create task');
  }

  export async function setTx(
    globalContext: GlobalStore.ContextType,
    chatsContext: ChatsStore.ContextType,
    tx: Transaction,
    isNotify: boolean,
  ): Promise<void> {
    let p = null;
    if (tx.userId != null) {
      p = await backend.getUserById(tx.userId);
    }

    if (p != null) {
      console.log('set tx with profile: ' + p.id);
      globalContext.dispatch(GlobalStore.setUser(p));
    }

    chatsContext.dispatch(ChatsStore.addTx(tx, isNotify, p));
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
  ) {
    let existedTxs: ChatsStore.Transactions = chatsContext.state.transactions.get(
      account.currency,
    )!;
    if (existedTxs === undefined) {
      existedTxs = {
        transactionById: new Map<ChatsStore.TxId, Transaction>(),
      };
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
      if (
        txs[i].status === TxStatus.Fail ||
        chatsContext.state.sentFromFractapp.has(txs[i].id)
      ) {
        continue;
      }

      if (existedTxs.transactionById.has(txs[i].id) && isSynced) {
        return;
      }

      await setTx(globalContext, chatsContext, txs[i], isSynced);
    }
  }

  export async function sync(
    accountsContext: AccountsStore.ContextType,
    globalContext: GlobalStore.ContextType,
    chatsContext: ChatsStore.ContextType,
  ) {
    for (let value of accountsContext.state.accounts.values()) {
      await syncByAccount(
        value,
        globalContext.state.authInfo.isSynced,
        globalContext,
        chatsContext,
      );
    }

    if (!globalContext.state.authInfo.isSynced) {
      await globalContext.dispatch(GlobalStore.setSynced());
      console.log('set synced');
    }

    await globalContext.dispatch(GlobalStore.setSyncShow(false));
  }

  export async function checkPendingTxs(chatsContext: ChatsStore.ContextType) {
    for (let [currency, value] of chatsContext.state.pendingTransactions) {
      for (let i = 0; i < value.idsOfTransactions.length; i++) {
        const status = await backend.getTxStatus(value.idsOfTransactions[i]);
        if (status == null || status === TxStatus.Pending) {
          continue;
        }

        let tx = chatsContext.state.transactions
          ?.get(currency)
          ?.transactionById.get(value.idsOfTransactions[i])!;

        tx.status = status;

        chatsContext.dispatch(
          ChatsStore.confirmPendingTx(tx.id, tx.status, tx.currency, i),
        );
      }
    }
  }

  export async function updateUsersList(
    globalContext: GlobalStore.ContextType,
    chatsContext: ChatsStore.ContextType,
  ) {
    console.log('users update');

    for (let id of globalContext.state.users.keys()) {
      console.log('update user: ' + id);
      const user = await backend.getUserById(id);
      if (user === undefined) {
        globalContext.dispatch(GlobalStore.deleteUser(id));
        chatsContext.dispatch(ChatsStore.renameChat(id, 'Deleted'));
        continue;
      } else if (user == null) {
        continue;
      }

      if (
        chatsContext.state.chatsInfo.has(id) &&
        ((user.name !== undefined &&
          user.name !== '' &&
          user.name !== chatsContext.state.chatsInfo.get(id)!.name) ||
          (user.name === '' &&
            user.username !== chatsContext.state.chatsInfo.get(id)!.name))
      ) {
        chatsContext.dispatch(
          ChatsStore.renameChat(
            id,
            user.name !== undefined && user.name !== ''
              ? user.name
              : user.username,
          ),
        );
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
      if (
        new BN(account.planks).cmp(planks) !== 0 ||
        account.balance !== viewBalance
      ) {
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
