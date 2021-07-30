import React, {useEffect, useState, useRef} from 'react';
import SplashScreen from 'react-native-splash-screen';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  StatusBar,
  Text,
  View,
  AppState,
} from 'react-native';
import {Dialog} from 'components/Dialog';
import {PassCode} from 'components/PassCode';
import tasks from 'utils/tasks';
import GlobalStore from 'storage/Global';
import {Navigation} from 'screens/Navigation';
import changeNavigationBarColor, {
  hideNavigationBar,
  showNavigationBar,
} from 'react-native-navigation-bar-color';
import PasscodeUtil from 'utils/passcode';
import {showMessage} from 'react-native-flash-message';
import DB from 'storage/DB';
import {useNetInfo} from '@react-native-community/netinfo';
import AccountsStore from 'storage/Accounts';
import {Loader} from 'components/Loader';
import backend from 'utils/api';
import StringUtils from 'utils/string';
import {navigate} from 'utils/RootNavigation';
import {ChatInfo} from 'types/chatInfo';
import websocket from 'utils/websocket';
import BackendApi from 'utils/api';
import { useDispatch, useSelector } from 'react-redux';
import UsersStore from 'storage/Users';
import ChatsStore from 'storage/Chats';
import ServerInfoStore from 'storage/ServerInfo';
import { toCurrency } from 'types/wallet';
import DialogStore from 'storage/Dialog';
import { Adaptors } from 'adaptors/adaptor';

export default function App() {
  const appState = useRef(AppState.currentState);

  const dispatch = useDispatch();
  const globalState: GlobalStore.State = useSelector((state: any) => state.global);
  const usersState: UsersStore.State = useSelector((state: any) => state.users);
  const chatsState: ChatsStore.State = useSelector((state: any) => state.chats);
  const accountsState: AccountsStore.State = useSelector((state: any) => state.accounts);
  const serverInfoState: ServerInfoStore.State = useSelector((state: any) => state.serverInfo);
  const dialogState: DialogStore.State = useSelector((state: any) => state.dialog);

  const [isLoading, setLoading] = useState<boolean>(false);
  const [isLocked, setLocked] = useState<boolean>(false);
  const [isBiometry, setBiometry] = useState<boolean>(false);
  const [isConnected, setConnected] = useState<boolean>(true);
  const [isWsLoaded, setWsLoaded] = useState<boolean>(false);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    console.log('start ' + new Date().toTimeString());
    hideNavigationBar();
    setLoading(true);

    DB.getAuthInfo().then(async (authInfo) => {
      if (authInfo == null || !authInfo.hasWallet) {
        //TODO onLoaded();

        console.log('end ' + new Date().toTimeString());

        return;
      }

      setLocked(authInfo.hasPasscode);
      setBiometry(authInfo.hasBiometry);

      console.log('init pub data');

      await tasks.init(dispatch);

      await Adaptors.init(serverInfoState);

      console.log('end pub data');
    });
  }, [globalState.authInfo.hasWallet]);

  useEffect(() => {
    console.log('Is Global init? ' + globalState.isInitialized);
    console.log('Is Accounts init? ' + accountsState.isInitialized);
    console.log('Is Users init? ' + usersState.isInitialized);
    console.log('Is Chats init? ' + chatsState.isInitialized);
    console.log('Is Server Info init? ' + serverInfoState.isInitialized);

    if (
      !globalState.isInitialized ||
      !accountsState.isInitialized ||
      !usersState.isInitialized ||
      !chatsState.isInitialized ||
      !serverInfoState.isInitialized
    ) {
      return;
    }

    (async () => {
      tasks.initPrivateData();

      tasks.createTask(
        accountsState,
        globalState,
        usersState,
        chatsState,
        serverInfoState,
        dispatch
      );

      const api = websocket.getWsApi(dispatch);
      api.open();
      setWsLoaded(true);

      if (!globalState.isRegisteredInFractapp) {
        const rsCode = await BackendApi.auth(backend.CodeType.CryptoAddress);
        console.log(rsCode);
        switch (rsCode) {
          case 200:
            dispatch(GlobalStore.actions.signInFractapp());
            break;
        }
      }

      dispatch(GlobalStore.actions.setAllStatesLoaded());
     /* if (isBiometry) {
        unlockWithBiometry()
          .then(() => onLoaded())
          .catch(onLoaded);
      } else {
        onLoaded();
      }*/

      console.log('end ' + new Date().toTimeString());
    })();
  }, [
    globalState.isInitialized,
    accountsState.isInitialized,
    usersState.isInitialized,
    chatsState.isInitialized,
    serverInfoState.isInitialized,
  ]);

  console.log('render: ' + Date.now());

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
}
