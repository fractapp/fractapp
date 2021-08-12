import BackgroundTimer from 'react-native-background-timer';
import DB from 'storage/DB';
import backend from 'utils/api';
import AccountsStore from 'storage/Accounts';
import { Currency } from 'types/wallet';
import { Account } from 'types/account';
import { Transaction, TxStatus } from 'types/transaction';
import GlobalStore from 'storage/Global';
import ChatsStore from 'storage/Chats';
import BN from 'bn.js';
import { Adaptors } from 'adaptors/adaptor';
import math from 'utils/math';
import MathUtils from 'utils/math';
import { Dispatch, Store } from 'redux';
import UsersStore from 'storage/Users';
import ServerInfoStore from 'storage/ServerInfo';
import Storage from 'storage/Store';
import { Message, UndeliveredMessagesInfo } from 'types/message';

/**
 * @namespace
 * @category Utils
 */
namespace Task {
  const sec = 1000;
  const min = 60 * sec;

  export async function init(dispatch: Dispatch<any>) {
    const accounts: {
      [id in Currency]: Account
    } = <{
      [id in Currency]: Account
    }>{};

    let accountsAddress = await DB.getAccounts();
    if (accountsAddress == null || accountsAddress.length === 0) {
      accountsAddress = [];
    }

    for (let i = 0; i < accountsAddress?.length; i++) {
      const account = await DB.getAccountInfo(accountsAddress[i]);

      if (account == null) {
        continue;
      }
      accounts[account.currency] = account;
    }
    dispatch(AccountsStore.actions.set({
      accounts: accounts,
      isInitialized: true,
    }));

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
        urls: {},
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

  export async function createTask(
    store: Store,
    states: Storage.States,
    dispatch: Dispatch<any>
  ) {
    console.log('start create task');

    if (
      states.accounts.accounts == null
    ) {
      throw new Error('accounts not found');
    }

    const tasks: Array<Promise<void>> = [];

    tasks.push(updateBalances(store, dispatch));
    tasks.push(updateServerInfo(dispatch));

    BackgroundTimer.setInterval(async () => {
      await updateServerInfo(dispatch);
    }, min);

    checkPendingTxs(store, dispatch);
    sync(store, dispatch);

    BackgroundTimer.setInterval(async () => {
      await updateBalances(store, dispatch);

      if (!states.global.authInfo.isSynced) {
        return;
      }

      await checkPendingTxs(store, dispatch);
      await sync(store, dispatch);
    }, sec);

    updateUsersList(store, dispatch);
    BackgroundTimer.setInterval(async () => {
      await updateUsersList(store, dispatch);
    }, 20 * min);

    for (let i = 0; i < tasks.length; i++) {
      await tasks[i];
    }

    console.log('end create task');
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
      dispatch(UsersStore.actions.setUser({
        isAddressOnly: false,
        title: p.name === '' ? p.username : p.name,
        value: p,
      }));
    } else {
      dispatch(UsersStore.actions.setUser({
        isAddressOnly: true,
        title: tx.address,
        value:  {
          address: tx.address,
          currency: tx.currency,
        },
      }));
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
    let existedTxs: ChatsStore.Transactions =
      states.chats.transactions[account.currency]!;
    if (existedTxs === undefined) {
      existedTxs = {
        transactionById: {},
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
        states.chats.sentFromFractapp[txs[i].id]
      ) {
        continue;
      }

      if (
        existedTxs.transactionById[txs[i].id] ||
        existedTxs.transactionById['sent-' + txs[i].hash]
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
    for (let [key, account] of Object.entries(states.accounts.accounts)) {
      await syncByAccount(
        states.global.profile.id,
        account,
        states.global.authInfo.isSynced,
        states,
        dispatch,
      );
    }

    await updateMessages(dispatch);
    if (!states.global.authInfo.isSynced) {
      dispatch(GlobalStore.actions.setSynced());
      console.log('set synced');
    }

    await dispatch(GlobalStore.actions.hideSync());
  }

  async function updateMessages(
    dispatch: Dispatch<any>,
  ) {
    const messagesInfo = await backend.getUnreadMessages();
    if (messagesInfo == null) {
      return;
    }

    if (messagesInfo.messages.length === 0) {
      return;
    }
    for (let [key, user] of Object.entries(messagesInfo.users)) { //TODO; update many
      dispatch(UsersStore.actions.setUser({
        isAddressOnly: false,
        title: user.name === '' ? user.username : user.name,
        value: user,
      }));
    }

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

    for (let id of Object.keys(states.users.users)) {
      console.log('update user: ' + id);
      const user = await backend.getUserById(id);
      if (user === undefined) {
        //TODO: dispatch(UsersStore.actions.deleteUser(id));
        continue;
      } else if (user == null) {
        continue;
      }

      dispatch(UsersStore.actions.setUser({
        isAddressOnly: false,
        title: user.name === '' ? user.username : user.name,
        value: user,
      }));
    }
  }

  export async function updateBalances(
    store: Store,
    dispatch: Dispatch<any>,
  ) {
    const states: Storage.States = store.getState();

    for (let [key, account] of Object.entries(states.accounts.accounts)) {
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
        dispatch(
          AccountsStore.actions.updateBalance({
            currency: account.currency,
            balance: viewBalance,
            planks: planks.toString(),
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

    for (let url of info.substrateUrls) {
      dispatch(ServerInfoStore.actions.setUrl({
          network: url.network,
          url: url.url,
        })
      );
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
