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
}
export default Store;
