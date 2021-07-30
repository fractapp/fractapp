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

  const netInfo = useNetInfo();

  const unlockWithBiometry = async () => {
    const dbPasscode = await DB.getPasscode();
    const passcodeArray = new Array<number>();
    for (let i = 0; i < dbPasscode.length; i++) {
      passcodeArray.push(Number(dbPasscode[i]));
    }

    await onSubmitPasscode(passcodeArray);
  };

  const onSubmitPasscode = async (passcode: Array<number>) => {
    let hash = await DB.getPasscodeHash();
    let salt = await DB.getSalt();

    if (salt == null) {
      Alert.alert('Please contact support: support@fractapp.com');
      return;
    }

    if (hash === PasscodeUtil.hash(passcode.join(''), salt)) {
      setLocked(false);
      setLoading(true);
      onLoaded();
    } else {
      showMessage({
        message: StringUtils.texts.showMsg.incorrectPasscode,
        type: 'danger',
        icon: 'warning',
      });
    }
  };

  useEffect(() => {
    AppState.addEventListener('change', _handleAppStateChange);
    Linking.addEventListener('url', openUrlEvent);

    return () => {
      Linking.removeEventListener('url', openUrlEvent);
      AppState.removeEventListener('change', _handleAppStateChange);
    };
  }, []);

  useEffect(() => {
    if (!isWsLoaded) {
      return;
    }

    AppState.addEventListener('change', _handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
    };
  }, [ isWsLoaded]);

  const _handleAppStateChange = (nextAppState: any) => {
    if (!globalState.isRegisteredInFractapp) {
      return;
    }
    const api = websocket.getWsApi(dispatch);
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {

      api.open();
      console.log('App has come to the foreground!');
    } else if (
      appState.current === 'active' && (
      nextAppState === 'inactive' || nextAppState === 'background')
    ) {
      api.close();
      console.log('App has come to the background!');
    }

    appState.current = nextAppState;
  };

  const openUrlEvent = (ev: any) => {
    setUrl(ev?.url);
    setLoading(true);
  };

  useEffect(() => {
    if (url == null) {
      return;
    }
    openUrl(url);
  }, [url]);

  const openUrl = async (url: string | null) => {
    console.log('url: ' + url);
    let chat: ChatInfo | null = null;

    try {
      if (
        url !== null &&
        url !== undefined &&
        (url?.startsWith('fractapp://chat') ||
          url?.startsWith('https://send.fractapp.com/send.html'))
      ) {
        let user = '';
        let type = '';
        let currency = '';
        if (url?.startsWith('fractapp://chat')) {
          url = url.replace('fractapp://chat/', '');
          const params = url.split('/');
          type = params[0];
          user = params[1];
          currency = params[2];
        } else {
          url = url.replace('https://send.fractapp.com/send.html?', '');
          const urlParams = url.split('&');
          for (let p of urlParams) {
            if (p.startsWith('type')) {
              type = p.replace('type=', '');
            } else if (p.startsWith('user')) {
              user = p.replace('user=', '');
            } else if (p.startsWith('currency')) {
              currency = p.replace('currency=', '');
            }
          }
        }
        console.log('Open link by user and type: ' + user + ' ' + type);

        if (chatsState.chatsInfo[user]) {
          chat = chatsState.chatsInfo[user]!;
        } else {
          let profile = null;
          if (type === 'user') {
            profile = await backend.getUserById(user);
          }

          if (type === 'user' && profile !== undefined) {
            dispatch(UsersStore.actions.setUser({
              isAddressOnly: false,
              title: profile?.name! !== '' ? profile?.name! : profile?.username!,
              value: profile!,
            }));
            chat = {
              id: user,
              notificationCount: 0,
              lastMsgId: '',
            };
          } else if (type === 'address') {
            dispatch(UsersStore.actions.setUser({
              isAddressOnly: true,
              title: user,
              value: {
                address: user,
                currency: toCurrency(currency),
              },
            }));
            chat = {
              id: user,
              notificationCount: 0,
              lastMsgId: '',
            };
          }
        }
      }
    } catch (e) {
    }

    showNavigationBar();
    setLoading(false);
    setUrl(null);
    console.log('loading off');
    changeNavigationBarColor('#FFFFFF', true, true);
    SplashScreen.hide();

    if (chat != null) {
      navigate('Chat', {
        chatInfo: chat,
      });
    }
  };

  const onLoaded = () => {
    Linking.getInitialURL().then((url) => {
      openUrl(url);
    });
  };

  useEffect(() => {
    if (isLoading) {
      return;
    }
    console.log('start ' + new Date().toTimeString());
    hideNavigationBar();
    setLoading(true);

    DB.getAuthInfo().then(async (authInfo) => {
      if (authInfo == null || !authInfo.hasWallet) {
        onLoaded();

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

      if (isBiometry) {
        unlockWithBiometry()
          .then(() => onLoaded())
          .catch(onLoaded);
      } else {
        onLoaded();
      }

      console.log('end ' + new Date().toTimeString());
    })();
  }, [
    globalState.isInitialized,
    accountsState.isInitialized,
    usersState.isInitialized,
    chatsState.isInitialized,
    serverInfoState.isInitialized,
  ]);

  useEffect(() => {
    if (
      !globalState.isRegisteredInFractapp ||
      !globalState.isUpdatingProfile ||


      !globalState.isInitialized ||
      !accountsState.isInitialized ||
      !usersState.isInitialized ||
      !chatsState.isInitialized ||
      !serverInfoState.isInitialized
    ) {
      return;
    }

    backend.myProfile().then(([code, profile]) => {
      console.log('update profile: ' + profile?.lastUpdate);
      if (code === 401) {
        dispatch(GlobalStore.actions.signOutFractapp());
      } else if (code === 200) {
        dispatch(GlobalStore.actions.setProfile(profile));
      }
      dispatch(GlobalStore.actions.setUpdatingProfile(false));
    });
  }, [
    globalState.isRegisteredInFractapp,
    globalState.isUpdatingProfile,
    globalState.isInitialized,
    accountsState.isInitialized,
    usersState.isInitialized,
    chatsState.isInitialized,
    serverInfoState.isInitialized,
  ]);

  useEffect(() => {
    if (netInfo.isConnected !== isConnected) {
      setConnected(netInfo.isConnected ?? false);
    }
  }, [netInfo.isConnected]);

  useEffect(() => {
    if (!globalState.isInitialized) {
      return;
    }

    if (isConnected) {
      showMessage({
        message: StringUtils.texts.showMsg.connectionRestored,
        type: 'success',
        icon: 'success',
        position: 'top',
      });
    }
  }, [isConnected]);

  useEffect(() => {
    if (!globalState.isInitialized) {
      return;
    }

    if (!isConnected) {
      showMessage({
        message: StringUtils.texts.showMsg.invalidConnection,
        type: 'danger',
        icon: 'danger',
        hideOnPress: false,
        autoHide: false,
        position: 'top',
      });
    }
  }, [isConnected, globalState.isInitialized]);

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
      {isLocked ? (
        <PassCode
          isBiometry={isBiometry}
          description={StringUtils.texts.passCode.verifyDescription}
          onSubmit={onSubmitPasscode}
        />
      ) : (
        <Navigation isInitialized={globalState.isInitialized} />
      )}
      <Dialog
        visible={dialogState.dialog.visible}
        onPress={
          dialogState.dialog.onPress !== undefined
            ? dialogState.dialog.onPress!
            : () => console.log('invalid dialog onPress')
        }
        title={dialogState.dialog.title}
        text={dialogState.dialog.text}
      />
      {isLoading && (
        <View
          style={{
            display: 'flex',
            alignItems: 'stretch',
            position: 'absolute',
            backgroundColor: 'white',
            height: Dimensions.get('screen').height,
            width: '100%',
          }}>
          <View
            style={{
              height: Dimensions.get('window').height,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View>
              <Image
                source={require('assets/img/logo.png')}
                style={{width: 80, height: 80, marginBottom: 20}}
              />
              <ActivityIndicator testID="loader" size={30} color="#2AB2E2" />
            </View>
          </View>
        </View>
      )}
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
      {!isLoading &&
        !isLocked &&
        globalState.loadInfo.isSyncShow &&
        globalState.authInfo.hasWallet && (
          <View
            style={{
              position: 'absolute',
              bottom: 70,
              alignSelf: 'center',
              backgroundColor: '#2AB2E2',
              flexDirection: 'row',
              padding: 5,
              paddingRight: 12,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 20,
            }}>
            <ActivityIndicator testID="loader" size={30} color="white" />
            <Text
              style={{
                marginLeft: 4,
                fontSize: 15,
                color: 'white',
                fontFamily: 'Roboto-Regular',
                fontStyle: 'normal',
                fontWeight: 'normal',
              }}>
              {StringUtils.texts.SynchronizationTitle}
            </Text>
          </View>
        )}
    </View>
  );
}
