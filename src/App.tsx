import React, { useEffect, useRef, useState } from 'react';
import SplashScreen from 'react-native-splash-screen';
import { ActivityIndicator, Alert, AppState, Dimensions, Linking, StatusBar, Text, View } from 'react-native';
import { Dialog } from 'components/Dialog';
import { PassCode } from 'components/PassCode';
import GlobalStore from 'storage/Global';
import { Navigation } from 'screens/Navigation';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import PasscodeUtil from 'utils/passcode';
import { showMessage } from 'react-native-flash-message';
import DB from 'storage/DB';
import { useNetInfo } from '@react-native-community/netinfo';
import { Loader } from 'components/Loader';
import backend from 'utils/api';
import BackendApi from 'utils/api';
import StringUtils from 'utils/string';
import { navigate } from 'utils/RootNavigation';
import { ChatInfo } from 'types/chatInfo';
import { useDispatch, useSelector } from 'react-redux';
import DialogStore from 'storage/Dialog';
import Init from './Init';
import { Store } from 'redux';
import tasks from 'utils/tasks';
import { Adaptors } from 'adaptors/adaptor';
import { ConfirmTransaction } from 'components/ConfirmTransaction';

const App = ({store}: {store: Store}) => {
  const appState = useRef(AppState.currentState);

  const dispatch = useDispatch();
  const globalState: GlobalStore.State = useSelector((state: any) => state.global);
  const dialogState: DialogStore.State = useSelector((state: any) => state.dialog);

  const netInfo = useNetInfo();

  const [isLocked, setLocked] = useState<boolean>(false);
  const [isBiometry, setBiometry] = useState<boolean>(false);
  const [isConnected, setConnected] = useState<boolean>(true);
  const [url, setUrl] = useState<string | null>(null);

  const unlockWithBiometry = async () => {
    const dbPasscode = await DB.getPasscode();
    const passcodeArray: Array<number> = [];
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
      dispatch(GlobalStore.actions.showLoading());
      onLoaded();
    } else {
      showMessage({
        message: StringUtils.texts.showMsg.incorrectPasscode,
        type: 'danger',
        icon: 'warning',
      });
    }
  };

  const _handleAppStateChange = (nextAppState: any) => {
    if (!globalState.isRegisteredInFractapp) {
      return;
    }

    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      dispatch(GlobalStore.actions.showSync());
      tasks.createTasks(store, dispatch);
      console.log('App has come to the foreground!');
    } else if (
      appState.current === 'active' && (
      nextAppState === 'inactive' || nextAppState === 'background')
    ) {
      tasks.cancelTasks();
      console.log('App has come to the background!');
    }

    appState.current = nextAppState;
  };

  // start app
  const openUrl = async (url: string | null) => {
    console.log('open url: ' + url);
    let chat: ChatInfo | null = null;

    /*  try {
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
      }*/

    //showNavigationBar();

    dispatch(GlobalStore.actions.hideLoading());
    setUrl(null);
    console.log('loading off');
    changeNavigationBarColor('#FFFFFF', true, true);
    SplashScreen.hide();

    if (chat !== null) {
      navigate('Chat', {
        chatInfo: chat,
      });
    }
  };
  const openUrlEvent = (ev: any) => {
    setUrl(ev?.url);
    dispatch(GlobalStore.actions.showLoading());
  };
  const onLoaded = () => {
    Linking.getInitialURL().then((url) => {
      openUrl(url);
    });
  };

  // init url
  useEffect(() => {
    Linking.addEventListener('url', openUrlEvent);

    return () => {
      Linking.removeEventListener('url', openUrlEvent);
    };
  }, []);
  // open by url
  useEffect(() => {
    if (url == null) {
      return;
    }
    openUrl(url);
  }, [url]);

  // locking
  useEffect(() => {
    if (!globalState.loadInfo.isAllStatesLoaded) {
      return;
    }

    setLocked(globalState.authInfo.hasPasscode);
    setBiometry(globalState.authInfo.hasBiometry);

    if (globalState.authInfo.hasBiometry) {
      unlockWithBiometry()
        .then(() => onLoaded())
        .catch(onLoaded);
    } else {
      onLoaded();
    }

    AppState.addEventListener('change', _handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
    };
  }, [
    globalState.loadInfo.isAllStatesLoaded,
  ]);

  //start task
  useEffect(() => {
    if (!globalState.loadInfo.isAllStatesLoaded || !globalState.authInfo.hasWallet) {
      return;
    }

    (async () => {
      tasks.initPrivateData();

      tasks.createTasks(store, dispatch);

      console.log('globalState.isRegisteredInFractapp: ' + globalState.isRegisteredInFractapp);
      if (!globalState.isRegisteredInFractapp) {
        try {
          const rsCode = await BackendApi.auth(backend.CodeType.CryptoAddress);
          console.log('rsCode: ' + rsCode);
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

      dispatch(GlobalStore.actions.hideLoading());
    })();
  }, [globalState.loadInfo.isAllStatesLoaded, globalState.authInfo.hasWallet]);

  //updating profile
  useEffect(() => {
    if (
      !globalState.isRegisteredInFractapp ||
      !globalState.isUpdatingProfile ||
      !globalState.loadInfo.isAllStatesLoaded
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
    globalState.loadInfo.isAllStatesLoaded,
  ]);

  // network
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

  // console.log('render: ' + Date.now());
  // console.log('lobalState.loadInfo.isAllStatesLoaded: ' + globalState.loadInfo.isAllStatesLoaded);

  if (!globalState.loadInfo.isAllStatesLoaded) {
    return (<Init store={store} />);
  }

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
        <Navigation isInitialized={globalState.authInfo.hasWallet} />
      )}
      {<ConfirmTransaction
        isShow={dialogState.confirmTxInfo.isShow}
        confirmTxInfo={dialogState.confirmTxInfo.info}
        onConfirm={() => console.log('close')}
      />}
      <Dialog
        visible={dialogState.dialog.visible}
        dispatch={dispatch}
        title={dialogState.dialog.title}
        text={dialogState.dialog.text}
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
      {!globalState.loadInfo.isLoadingShow &&
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
};

export default App;
