import BackgroundTimer from 'react-native-background-timer';
import DB from 'storage/DB';
import backend from 'utils/api';
import AccountsStore from 'storage/Accounts';
import {Currency} from 'types/wallet';
import {Account} from 'types/account';
import {Transaction, TxStatus} from 'types/transaction';
import GlobalStore from 'storage/Global';
import ChatsStore from 'storage/Chats';
import BN from 'bn.js';
import {Adaptors} from 'adaptors/adaptor';
import math from 'utils/math';
import { Dispatch } from 'redux';
import UsersStore from 'storage/Users';
import ServerInfoStore from 'storage/ServerInfo';

/**
 * @namespace
 * @category Utils
 */
namespace Task {
  const sec = 1000;
  const min = 60 * sec;

  export async function init(dispatch: Dispatch<any>) {
    const accounts: Record<Currency, Account> = <Record<Currency, Account>>{};

    const accountsAddress = await DB.getAccounts();
    if (accountsAddress == null || accountsAddress.length === 0) {
      throw new Error('accounts not found');
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

    const chatsState = ChatsStore.initialState(); //TODO await DB.getChatsState();
    chatsState.isInitialized = true;

    dispatch(ChatsStore.actions.set(chatsState));

    const authInfo = await DB.getAuthInfo();
    const profile = await DB.getProfile();
    const contacts = await DB.getContacts();
    const users = {};//await DB.getUsers();

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
      GlobalStore.actions.set(
        {
          isRegisteredInFractapp: profile != null,
          isUpdatingProfile: profile != null,
          profile: profile != null ? profile : GlobalStore.initialState().profile,
          authInfo: authInfo ?? GlobalStore.initialState().authInfo,
          loadInfo: GlobalStore.initialState().loadInfo,
          isInitialized: true,
        })
    );
    dispatch(
      UsersStore.actions.set(
        {
          contacts: contacts,
          users: users,
          isInitialized: true,
        }
      )
    );

    dispatch(
      ServerInfoStore.actions.set(serverInfo!)
    );
  }

  export async function createTask(
    accountsState: AccountsStore.State,
    globalState: GlobalStore.State,
    usersState: UsersStore.State,
    chatsState: ChatsStore.State,
    serverInfo: ServerInfoStore.State,
    dispatch: Dispatch<any>
  ) {
    console.log('start create task');

    if (
      accountsState.accounts == null
    ) {
      throw new Error('accounts not found');
    }

    const tasks: Array<Promise<void>> = [];

    tasks.push(updateBalances(globalState, accountsState, dispatch));
    tasks.push(updateServerInfo(serverInfo, dispatch));

    BackgroundTimer.setInterval(async () => {
      await updateServerInfo(serverInfo, dispatch);
    }, min);


    checkPendingTxs(chatsState, dispatch);
    sync(accountsState, globalState, chatsState, usersState, dispatch);

    BackgroundTimer.setInterval(async () => {
      await updateBalances(globalState, accountsState, dispatch);

      if (!globalState.authInfo.isSynced) {
        return;
      }

      await checkPendingTxs(chatsState, dispatch);
      await sync(accountsState, globalState, chatsState, usersState, dispatch);
    }, 3 * sec);

    updateUsersList(usersState, dispatch);
    BackgroundTimer.setInterval(async () => {
      await updateUsersList(usersState, dispatch);
    }, 20 * min);

    for (let i = 0; i < tasks.length; i++) {
      await tasks[i];
    }

    console.log('end create task');
  }

  export async function setTx(
    globalState: GlobalStore.State,
    usersState: UsersStore.State,
    chatsState: ChatsStore.State,
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
    }

    dispatch(ChatsStore.actions.addTx({
      tx: tx,
      isNotify: isNotify,
    }, ));
  }

  export async function initPrivateData() {
    console.log('init private data');
    await backend.getJWT();
  }

  export async function syncByAccount(
    account: Account,
    isSynced: boolean,
    globalState: GlobalStore.State,
    chatsState: ChatsStore.State,
    usersState: UsersStore.State,
    dispatch: Dispatch<any>,
  ) {
    let existedTxs: ChatsStore.Transactions =
      chatsState.transactions[account.currency]!;
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
        chatsState.sentFromFractapp[txs[i].id]
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

      await setTx(globalState, usersState, chatsState, dispatch, txs[i], isSynced);
    }
  }

  export async function sync(
    accountsState: AccountsStore.State,
    globalState: GlobalStore.State,
    chatsState: ChatsStore.State,
    usersState: UsersStore.State,
    dispatch: Dispatch<any>,
  ) {
    for (let [key, account] of Object.entries(accountsState.accounts)) {
      await syncByAccount(
        account,
        globalState.authInfo.isSynced,
        globalState,
        chatsState,
        usersState,
        dispatch,
      );
    }

    if (!globalState.authInfo.isSynced) {
      dispatch(GlobalStore.actions.setSynced());
      console.log('set synced');
    }

    await dispatch(GlobalStore.actions.hideSync());
  }

  export async function checkPendingTxs(
    chatsState: ChatsStore.State,
    dispatch: Dispatch<any>
  ) {
    for (let [key, value] of Object.entries(chatsState.pendingTransactions)) {
      let currency: Currency = Number(key);
      for (let i = 0; i < value.idsOfTransactions.length; i++) {
        let tx = chatsState.transactions[currency]?.transactionById[value.idsOfTransactions[i]]!;

        const status = await backend.getTxStatus(tx.hash);

        if (status == null || status === TxStatus.Pending) {
          continue;
        }

        tx.status = status;
        dispatch(
          ChatsStore.actions.confirmPendingTx({
            txId: tx.id,
            status: tx.status,
            currency: tx.currency,
            index: i,
          }),
        );
      }
    }
  }

  export async function updateUsersList(
    usersState: UsersStore.State,
    dispatch: Dispatch<any>,
  ) {
    console.log('users update');

    for (let id of Object.keys(usersState.users)) {
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
    globalState: GlobalStore.State,
    accountsState: AccountsStore.State,
    dispatch: Dispatch<any>,
  ) {
    for (let [key, account] of Object.entries(accountsState.accounts)) {
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

        dispatch(
          AccountsStore.actions.updateBalance({
            currency: account.currency,
            balance: account.balance,
            planks: account.planks,
          }),
        );
      }
    }
  }

  export async function updateServerInfo(
    serverState: ServerInfoStore.State,
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
          price: priceInfo.value,
        }),
      );
    }
  }
}

export default Task;
