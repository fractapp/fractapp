import BackgroundTimer from 'react-native-background-timer';
import DB from 'storage/DB';
import backend from 'utils/fractappClient';
import AccountsStore from 'storage/Accounts';
import { Currency } from 'types/wallet';
import GlobalStore from 'storage/Global';
import ChatsStore from 'storage/Chats';
import { Dispatch, Store } from 'redux';
import UsersStore from 'storage/Users';
import ServerInfoStore from 'storage/ServerInfo';
import Storage from 'storage/Store';
import websocket from 'utils/websocket';

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
    store: Store
  ) {
    const states: Storage.States = store.getState();
    console.log('start create task');

    if (
      states.accounts.accounts == null
    ) {
      throw new Error('accounts not found');
    }

    checkPendingTxs(store);
    const checkPendingTask = BackgroundTimer.setInterval(async () => {
      try {
        await checkPendingTxs(store);
      } catch (e) {
        console.log('error: ' + (e as Error).toString());
      }
    }, 5 * sec);

    updateUsersList(store);
    const updateUsersTask = BackgroundTimer.setInterval(async () => {
      try {
        await updateUsersList(store);
      } catch (e) {
        console.log('error: ' + (e as Error).toString());
      }
    }, 5 * min);

    tasksIds.push(checkPendingTask);
    tasksIds.push(updateUsersTask);

    console.log('end create task');
  }

  export function cancelTasks() {
    console.log('cancel tasks');
    for (const id of tasksIds) {
      BackgroundTimer.clearInterval(id);
    }
  }

  export async function initPrivateData() {
    console.log('init private data');
    await backend.getJWT();
  }

  export async function checkPendingTxs(store: Store) {
    const states: Storage.States = store.getState();
    const ids = [];
    for (let [key, value] of Object.entries(states.chats.pendingTransactions)) {
      let currency: Currency = Number(key);
      for (let i = 0; i < value.idsOfTransactions.length; i++) {
        const tx = states.chats.transactions[currency]?.transactionById[value.idsOfTransactions[i]]!;
        ids.push(tx.hash);
      }
    }

    if (ids.length > 0) {
      websocket.getWsApi().getTxsStatuses(ids);
    }
  }

  export async function updateUsersList(store: Store) {
    const ids = [];
    const states: Storage.States = store.getState();

    for (let id of Object.keys(states.users.users)) {
      if (states.users.users[id].isAddressOnly) {
        continue;
      }

      ids.push(id);
    }

    if (ids.length > 0) {
      console.log('get users: ' + JSON.stringify(ids));

      websocket.getWsApi().getUsers(ids);
    }
  }
}

export default Task;
