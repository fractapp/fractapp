import BackgroundTimer from 'react-native-background-timer';
import DB from 'storage/DB';
import backend from 'utils/api';
import AccountsStore from 'storage/Accounts';
import { Currency } from 'types/wallet';
import { Account, AccountType, BalanceRs } from 'types/account';
import { Transaction, TxAction, TxStatus } from 'types/transaction';
import GlobalStore from 'storage/Global';
import ChatsStore from 'storage/Chats';
import { Adaptors } from 'adaptors/adaptor';
import math from 'utils/math';
import MathUtils from 'utils/math';
import { Dispatch, Store } from 'redux';
import UsersStore from 'storage/Users';
import ServerInfoStore from 'storage/ServerInfo';
import Storage from 'storage/Store';
import { DefaultMsgAction, Message } from 'types/message';
import { User } from 'types/profile';
// @ts-ignore
import { MAIN_BOT_ID } from '@env';
import BN from 'bn.js';

/**
 * @namespace
 * @category Utils
 */
namespace Task {
  const sec = 1000;
  const min = 60 * sec;

  const tasksIds: Array<number> = [];

  export async function createAccount(seed: string, dispatch: Dispatch<any>) {
    await DB.createAccounts(seed);
    await initAccounts(dispatch);
    dispatch(GlobalStore.actions.initWallet());
  }

  export async function initAccounts(dispatch: Dispatch<any>) {
    let accountsStore = (await DB.getAccountStore());
    if (accountsStore == null) {
      dispatch(AccountsStore.actions.set(<AccountsStore.State>{
        accounts: {},
        isInitialized: true,
      }));
      return;
    }
    accountsStore.isInitialized = true;
    dispatch(AccountsStore.actions.set(accountsStore));
  }

  export async function init(dispatch: Dispatch<any>) {
    const v = await DB.getVersion();
    const seed = await DB.getSeed();
    if (seed != null && (v == null || DB.NowDBVersion !== await DB.getVersion())) {
      await clearDB();

      await createAccount(seed!, dispatch);
    }

    await initAccounts(dispatch);
    const chatsState = await DB.getChatsState();
    chatsState.isInitialized = true;
    dispatch(ChatsStore.actions.set(chatsState));

    const authInfo = await DB.getAuthInfo();
    const profile = await DB.getProfile();
    const contacts = await DB.getContacts();
    const users = await DB.getUsers();
    dispatch(
      UsersStore.actions.set(
        {
          contacts: contacts,
          users: users,
          isInitialized: true,
        }
      )
    );

    let serverInfo = await DB.getServerInfo();
    if (serverInfo == null) {
      serverInfo = <ServerInfoStore.State>{
        prices: {},
        isInitialized: true,
      };
    }
    serverInfo!.isInitialized = true;
    dispatch(
      ServerInfoStore.actions.set(serverInfo!)
    );

    dispatch(
      GlobalStore.actions.set(
        {
          isRegisteredInFractapp: profile != null,
          isUpdatingProfile: profile != null,
          profile: profile != null ? profile : GlobalStore.initialState().profile,
          authInfo: authInfo ?? GlobalStore.initialState().authInfo,
          loadInfo: {
            isAllStatesLoaded: false,
            isSyncShow: true,
            isLoadingShow: false,
          },
          isInitialized: true,
        })
    );

    console.log('init task end');
  }

  export async function clearDB() {
    console.log('reset data start');
    await DB.deleteItem(DB.AsyncStorageKeys.authInfo);
    await DB.deleteItem(DB.AsyncStorageKeys.serverInfo);
    await DB.deleteItem(DB.AsyncStorageKeys.profile);
    await DB.deleteItem(DB.AsyncStorageKeys.accountsStore);

    await DB.deleteItem(DB.AsyncStorageKeys.chatsStorage);
    await DB.deleteItem(DB.AsyncStorageKeys.contacts);
    await DB.deleteItem(DB.AsyncStorageKeys.users);

    console.log('reset data end');
  }

  export async function createTasks(
    store: Store,
    dispatch: Dispatch<any>
  ) {
    const states: Storage.States = store.getState();
    console.log('start create task');

    if (
      states.accounts.accounts == null
    ) {
      throw new Error('accounts not found');
    }

    const tasks: Array<Promise<void>> = [];

    tasks.push(updateBalances(store, dispatch));
    tasks.push(updateServerInfo(dispatch));

    const priceTask = BackgroundTimer.setInterval(async () => {
      await updateServerInfo(dispatch);
    }, min);
    tasksIds.push(priceTask);

    checkPendingTxs(store, dispatch);
    sync(store, dispatch);

    const balanceTask = BackgroundTimer.setInterval(async () => {
      const s: Storage.States = store.getState();
      try {
        await updateBalances(store, dispatch);
      } catch (e) {}
      if (!s.global.authInfo.isFirstSync) {
        return;
      }

      try {
        await checkPendingTxs(store, dispatch);
      } catch (e){}
      try {
        await sync(store, dispatch);
      } catch (e){}
    }, sec);
    tasksIds.push(balanceTask);

    updateUsersList(store, dispatch);
    const usersTask = BackgroundTimer.setInterval(async () => {
      await updateUsersList(store, dispatch);
    }, 20 * min);
    tasksIds.push(usersTask);

    for (let i = 0; i < tasks.length; i++) {
      await tasks[i];
    }

    console.log('end create task');
  }

  export function cancelTasks() {
    console.log('cancel tasks');
    for (const id of tasksIds) {
      BackgroundTimer.clearInterval(id);
    }
  }

  export async function setTx(
    owner: string,
    dispatch: Dispatch<any>,
    tx: Transaction,
    isNotify: boolean,
  ): Promise<void> {
    let p = null;
    if (tx.userId != null) {
      p = await backend.getUserById(tx.userId);
    }

    if (p != null) {
      console.log('set tx with profile: ' + p.id);
      dispatch(UsersStore.actions.setUsers([{
        isAddressOnly: false,
        title: p.name === '' ? p.username : p.name,
        value: p,
      }]));
    } else {
      dispatch(UsersStore.actions.setUsers([{
        isAddressOnly: true,
        title: tx.address,
        value:  {
          address: tx.address,
          currency: tx.currency,
        },
      }])); //TODO: next release update many transactions by one iteration
    }

    dispatch(ChatsStore.actions.addTx({
      owner: owner,
      tx: tx,
      isNotify: isNotify,
    }));
  }

  export async function initPrivateData() {
    console.log('init private data');
    await backend.getJWT();
  }

  export async function syncByAccount(
    owner: string,
    account: Account,
    isSynced: boolean,
    states: Storage.States,
    dispatch: Dispatch<any>,
  ) {
    let existedTxs: ChatsStore.Transactions;
    if (states.chats.transactions[account.currency] === undefined) {
      existedTxs = {
        transactionById: {},
      };
    } else {
      existedTxs = states.chats.transactions[account.currency];
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
        states.chats.sentFromFractapp[txs[i].id]
      ) {
        continue;
      }

      if (
        existedTxs.transactionById[txs[i].id] ||
        (existedTxs.transactionById['sent-' + txs[i].hash] && txs[i].action !== TxAction.StakingWithdrawn)
      ) {
        if (isSynced) {
          return;
        } else {
          continue;
        }
      }

      await setTx(owner, dispatch, txs[i], isSynced);
    }
  }

  export async function sync(
    store: Store,
    dispatch: Dispatch<any>,
  ) {
    const states: Storage.States = store.getState();
    try {
      for (let [key, account] of Object.entries(states.accounts.accounts[AccountType.Main])) {
        await syncByAccount(
          states.global.profile.id,
          account,
          states.global.authInfo.isFirstSync,
          states,
          dispatch,
        );
      }

      await updateMessages(store, dispatch);
      if (!states.global.authInfo.isFirstSync) {
        dispatch(GlobalStore.actions.setSynced());
        console.log('set synced');
      }

      if (states.global.loadInfo.isSyncShow) {
        await dispatch(GlobalStore.actions.hideSync());
      }
    } catch (e) {
      console.log('error sync account: ' + e);
      await updateMessages(store, dispatch);
    }
  }

  async function updateMessages(
    store: Store,
    dispatch: Dispatch<any>,
  ) {
    const states: Storage.States = store.getState();
    if (!states.global.isRegisteredInFractapp) {
      return;
    }

    const messagesInfo = await backend.getUnreadMessages();
    if (messagesInfo == null) {
      return;
    }

    if (!states.chats.chatsInfo[MAIN_BOT_ID] && !messagesInfo.users[MAIN_BOT_ID]) {
      const last = await DB.getLastInitMsgTimeout();

      const now = Date.now();
      if (last == null || now > (last! + min * 30)) {
        console.log('send init msg');
        const timestamp = await backend.sendMsg({
          version: 1,
          value: '',
          action: DefaultMsgAction.Init,
          receiver: MAIN_BOT_ID,
          args: {},
        });
        if (timestamp != null) {
          await DB.setLastInitMsgTimeout(timestamp);
        }
      }
    }

    if (messagesInfo.messages.length === 0) {
      return;
    }

    const users: Array<User> = [];
    for (let [key, user] of Object.entries(messagesInfo.users)) {
      users.push({
        isAddressOnly: false,
        title: user.name === '' ? user.username : user.name,
        value: user,
      });
    }
    dispatch(UsersStore.actions.setUsers(users));

    const readMsg = [];
    const payload: Array<{
      chatId: string,
      msg: Message,
    }> = [];
    for (let message of messagesInfo.messages) {
      console.log('message getted: ' + Date.now());
      payload.push({
        chatId: message.sender,
        msg: message,
      });
      readMsg.push(message.id);
    }

    await backend.setRead(readMsg);

    dispatch(ChatsStore.actions.addMessages(payload));
  }

  export async function checkPendingTxs(
    store: Store,
    dispatch: Dispatch<any>
  ) {
    const states: Storage.States = store.getState();
    for (let [key, value] of Object.entries(states.chats.pendingTransactions)) {
      let currency: Currency = Number(key);
      for (let i = 0; i < value.idsOfTransactions.length; i++) {
        const tx = states.chats.transactions[currency]?.transactionById[value.idsOfTransactions[i]]!;
        const status = await backend.getTxStatus(tx.hash);
        if (status == null || status === TxStatus.Pending) {
          continue;
        }

        dispatch(
          ChatsStore.actions.confirmPendingTx({
            txId: tx.id,
            status: status,
            currency: tx.currency,
            index: i,
          }),
        );
      }
    }
  }

  export async function updateUsersList(
    store: Store,
    dispatch: Dispatch<any>,
  ) {
    const states: Storage.States = store.getState();

    console.log('users update');

    const users: Array<User> = [];
    for (let id of Object.keys(states.users.users)) {
      if (states.users.users[id].isAddressOnly) {
        continue;
      }
      console.log('update user: ' + id);
      const user = await backend.getUserById(id);
      console.log('user: ' + user);
      if (user === undefined) {
        dispatch(UsersStore.actions.setUsers([
          {
            isAddressOnly: false,
            title: 'Deleted',
            value: {
              id: id,
              name: 'Deleted',
              username: 'deleted',
              avatarExt: '',
              lastUpdate: 0,
              addresses: null,
              isChatBot: false,
            },
          },
        ]));
        continue;
      } else if (user == null) {
        continue;
      }

      users.push({
        isAddressOnly: false,
        title: user.name === '' ? user.username : user.name,
        value: user,
      });
    }

    dispatch(UsersStore.actions.setUsers(users));
  }

  export async function updateBalances(
    store: Store,
    dispatch: Dispatch<any>,
  ) {
    const states: Storage.States = store.getState();

    for (let [key, account] of Object.entries(states.accounts.accounts[AccountType.Main])) {
      const api = Adaptors.get(account.network)!;
      const balance: BalanceRs = await api.balance(account.address);
      if (balance == null) {
        continue;
      }

      const viewBalance = math.convertFromPlanckToViewDecimals(
        new BN(balance.transferable),
        api.decimals,
        api.viewDecimals,
      );
      dispatch(
        AccountsStore.actions.updateBalance({
          currency: account.currency,
          viewBalance: viewBalance,
          balance: {
            total: balance.total,
            transferable: balance.transferable,
            payableForFee: balance.payableForFee,
          },
        }),
      );

      if (new BN(balance.staking).cmp(new BN(0)) > 0 || (
        states.accounts.accounts[AccountType.Staking] !== undefined &&
        states.accounts.accounts[AccountType.Staking][account.currency] !== undefined
      )) {
        const viewStakingBalance = math.convertFromPlanckToViewDecimals(
          new BN(balance.staking),
          api.decimals,
          api.viewDecimals,
        );
        dispatch(
          AccountsStore.actions.updateBalanceSubAccount({
            accountType: AccountType.Staking,
            currency: account.currency,
            viewBalance: viewStakingBalance,
            balance: balance.staking,
          }),
        );
      }
    }
  }

  export async function updateServerInfo(
    dispatch: Dispatch<any>,
  ) {
    const info = await backend.getInfo();
    if (info == null) {
      return;
    }

    for (let priceInfo of info.prices) {
      dispatch(
        ServerInfoStore.actions.updatePrice({
          currency: priceInfo.currency,
          price: MathUtils.roundUsd(priceInfo.value),
        }),
      );
    }
  }
}

export default Task;
