import { configureStore } from '@reduxjs/toolkit';
import ChatsStore from 'storage/Chats';
import DialogStore from 'storage/Dialog';
import GlobalStore from 'storage/Global';
import ServerInfoStore from 'storage/ServerInfo';
import AccountsStore from 'storage/Accounts';
import UsersStore from 'storage/Users';

/**
 * @namespace
 * @category Storage
 */
namespace Store {
  export const initStore = () => {
    return configureStore({
      reducer: {
        global: GlobalStore.reducer,
        accounts: AccountsStore.reducer,
        chats: ChatsStore.reducer,
        dialog: DialogStore.reducer,
        serverInfo: ServerInfoStore.reducer,
        users: UsersStore.reducer,
      },
    });
  };
  export const initValues = () => ({
    global: GlobalStore.initialState(),
    accounts: AccountsStore.initialState(),
    chats: ChatsStore.initialState(),
    dialog: DialogStore.initialState(),
    serverInfo: ServerInfoStore.initialState(),
    users: UsersStore.initialState(),
  });

  export type States = {
    global: GlobalStore.State,
    accounts: AccountsStore.State,
    chats: ChatsStore.State,
    dialog: DialogStore.State,
    serverInfo: ServerInfoStore.State,
    users: UsersStore.State,
  }
}
export default Store;
