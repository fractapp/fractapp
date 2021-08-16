import React, { useEffect } from 'react';
import { Dimensions, StatusBar, View } from 'react-native';
import tasks from 'utils/tasks';
import GlobalStore from 'storage/Global';
import AccountsStore from 'storage/Accounts';
import backend from 'utils/api';
import BackendApi from 'utils/api';
import { useDispatch, useSelector } from 'react-redux';
import UsersStore from 'storage/Users';
import ChatsStore from 'storage/Chats';
import ServerInfoStore from 'storage/ServerInfo';
import { Adaptors } from 'adaptors/adaptor';
import { Store } from 'redux';
import { Loader } from 'components/Loader';

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

      dispatch(GlobalStore.actions.setAllStatesLoaded(true));
    })();
  }, [
    globalState.isInitialized,
    accountsState.isInitialized,
    usersState.isInitialized,
    chatsState.isInitialized,
    serverInfoState.isInitialized,

    globalState.authInfo.hasWallet,
  ]);

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
      {globalState.loadInfo.isLoadingShow && (
        <View
          style={{
            display: 'flex',
            alignItems: 'stretch',
            position: 'absolute',
            backgroundColor: 'white',
            height: Dimensions.get('screen').height,
            width: '100%',
          }}>
          <Loader />
        </View>
      )}
    </View>
  );
};

export default Init;
