import React, { useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import tasks from 'utils/tasks';
import GlobalStore from 'storage/Global';
import AccountsStore from 'storage/Accounts';
import backend from 'utils/api';
import BackendApi from 'utils/api';
import websocket from 'utils/websocket';
import { useDispatch, useSelector } from 'react-redux';
import UsersStore from 'storage/Users';
import ChatsStore from 'storage/Chats';
import ServerInfoStore from 'storage/ServerInfo';
import { Adaptors } from 'adaptors/adaptor';
import { Store } from 'redux';

const Init = ({store}: {store: Store}) => {
  const dispatch = useDispatch();
  const globalState: GlobalStore.State = useSelector((state: any) => state.global);
  const usersState: UsersStore.State = useSelector((state: any) => state.users);
  const chatsState: ChatsStore.State = useSelector((state: any) => state.chats);
  const accountsState: AccountsStore.State = useSelector((state: any) => state.accounts);
  const serverInfoState: ServerInfoStore.State = useSelector((state: any) => state.serverInfo);

  useEffect(() => {
    if (globalState.loadInfo.isAllStatesLoaded) {
      return;
    }

    console.log('start ' + new Date().toTimeString());
  //  hideNavigationBar();

    (async () => {
      await tasks.init(dispatch);
    })();
  }, []);

  useEffect(() => {
    console.log('Is Global init? ' + globalState.isInitialized);
    console.log('Is Accounts init? ' + accountsState.isInitialized);
    console.log('Is Users init? ' + usersState.isInitialized);
    console.log('Is Chats init? ' + chatsState.isInitialized);
    console.log('Is Server Info init? ' + serverInfoState.isInitialized);

    (async () => {
      if (
        !globalState.isInitialized ||
        !accountsState.isInitialized ||
        !usersState.isInitialized ||
        !chatsState.isInitialized ||
        !serverInfoState.isInitialized
      ) {
        return;
      }

      if (!globalState.authInfo.hasWallet) {
        dispatch(GlobalStore.actions.setAllStatesLoaded(true));
        return;
      }

      Adaptors.init(serverInfoState);

      tasks.initPrivateData();

      tasks.createTask(
        store,
        store.getState(),
        dispatch
      );

      const wsApi = websocket.getWsApi(dispatch);
      wsApi.open();

      console.log('globalState.isRegisteredInFractapp: ' + globalState.isRegisteredInFractapp);
      if (!globalState.isRegisteredInFractapp) {
        try {
          const rsCode = await BackendApi.auth(backend.CodeType.CryptoAddress);
          switch (rsCode) {
            case 200:
              dispatch(GlobalStore.actions.signInFractapp());
              break;
            case 401:
              dispatch(GlobalStore.actions.signOutFractapp());
              break;
          }
        } catch (e) {
          console.log(e);
        }
      }

      dispatch(GlobalStore.actions.setAllStatesLoaded(true));
      console.log('end ' + new Date().toTimeString());
    })();
  }, [
    globalState.isInitialized,
    accountsState.isInitialized,
    usersState.isInitialized,
    chatsState.isInitialized,
    serverInfoState.isInitialized,

    globalState.authInfo.hasWallet,
  ]);

  console.log('render init: ' + Date.now());

  return (
    <View
      style={{
        flex: 1,
      }}>
      <StatusBar
        backgroundColor={'white'}
        barStyle={'dark-content'}
        hidden={false}
      />
    </View>
  );
};

export default Init;
