import React, { useEffect } from 'react';
import { Alert, Dimensions, StatusBar, View } from 'react-native';
import tasks from 'utils/tasks';
import GlobalStore from 'storage/Global';
import AccountsStore from 'storage/Accounts';
import { useDispatch, useSelector } from 'react-redux';
import UsersStore from 'storage/Users';
import ChatsStore from 'storage/Chats';
import ServerInfoStore from 'storage/ServerInfo';
import { Loader } from 'components/Loader';
import { Adaptors } from 'adaptors/adaptor';
import StringUtils from 'utils/string';

const Init = () => {
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
      try {
        console.log('start init #1: ' + new Date());
        await Adaptors.init();
        console.log('start init #1 (two): ' + new Date());
        await tasks.init(dispatch);
        console.log('end init #1' + new Date());
      } catch (e) {
        console.log('e: ' + e);
        Alert.alert(StringUtils.texts.showMsg.invalidConnection);
      }
    })();
  }, []);

  useEffect(() => {
    if (
      !globalState.isInitialized ||
      !accountsState.isInitialized ||
      !usersState.isInitialized ||
      !chatsState.isInitialized ||
      !serverInfoState.isInitialized
    ) {
      return;
    }

    console.log('Is Global init? ' + globalState.isInitialized);
    console.log('Is Accounts init? ' + accountsState.isInitialized);
    console.log('Is Users init? ' + usersState.isInitialized);
    console.log('Is Chats init? ' + chatsState.isInitialized);
    console.log('Is Server Info init? ' + serverInfoState.isInitialized);
    dispatch(GlobalStore.actions.setAllStatesLoaded(true));
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
