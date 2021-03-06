import React, {useContext, useEffect, useState} from 'react';
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
} from 'react-native';
import {Dialog} from 'components/Dialog';
import {PassCode} from 'components/PassCode';
import tasks from 'utils/tasks';
import GlobalStore from 'storage/Global';
import DialogStore from 'storage/Dialog';
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
import PricesStore from 'storage/Prices';
import ChatsStore from 'storage/Chats';
import {Loader} from 'components/Loader';
import backend from 'utils/backend';
import StringUtils from 'utils/string';
import {navigate} from 'utils/RootNavigation';
import {ChatInfo, ChatType} from 'types/chatInfo';
import {toCurrency} from 'types/wallet';

export default function App() {
  const globalContext = useContext(GlobalStore.Context);
  const dialogContext = useContext(DialogStore.Context);
  const accountsContext = useContext(AccountsStore.Context);
  const pricesContext = useContext(PricesStore.Context);
  const chatsContext = useContext(ChatsStore.Context);

  const [isLoading, setLoading] = useState<boolean>(false);
  const [isLocked, setLocked] = useState<boolean>(false);
  const [isBiometry, setBiometry] = useState<boolean>(false);
  const [isConnected, setConnected] = useState<boolean>(true);
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
    Linking.addEventListener('url', openUrlEvent);

    return () => Linking.removeEventListener('url', openUrlEvent);
  }, []);

  useEffect(() => {
    if (url == null) {
      return;
    }
    openUrl(url);
  }, [url]);

  const openUrlEvent = (ev: any) => {
    setUrl(ev?.url);
    setLoading(true);
  };

  const onLoaded = () => {
    Linking.getInitialURL().then((url) => {
      openUrl(url);
    });
  };

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

        if (chatsContext.state.chatsInfo.has(user)) {
          chat = chatsContext.state.chatsInfo.get(user)!;
        } else {
          let profile = null;
          if (type === 'user') {
            profile = await backend.getUserById(user);
          }

          if (type === 'user' && profile !== undefined) {
            globalContext.dispatch(GlobalStore.setUser(profile!));
            chat = {
              id: user,
              name: profile?.name! !== '' ? profile?.name! : profile?.username!,
              lastTxId: '',
              lastTxCurrency: 0,
              notificationCount: 0,
              timestamp: 0,
              type: ChatType.WithUser,
              details: null,
            };
          } else if (type === 'address') {
            chat = {
              id: user,
              name: user,
              lastTxId: '',
              lastTxCurrency: 0,
              notificationCount: 0,
              timestamp: 0,
              type: ChatType.AddressOnly,
              details: {
                currency: toCurrency(currency),
                address: user,
              },
            };
          }
        }
      }
    } catch (e) {}

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

  useEffect(() => {
    if (isLoading) {
      return;
    }
    console.log('start ' + new Date().toTimeString());
    hideNavigationBar();
    setLoading(true);

    DB.getAuthInfo().then(async (authInfo) => {
      if (authInfo == null || !authInfo.isAuthed) {
        onLoaded();

        console.log('end ' + new Date().toTimeString());

        return;
      }

      setLocked(authInfo.isPasscode);
      setBiometry(authInfo.isBiometry);

      console.log('init pub data');
      await tasks.init(
        globalContext,
        accountsContext,
        pricesContext,
        chatsContext,
      );
      console.log('end pub data');
    });
  }, [globalContext.state.authInfo.isAuthed]);

  useEffect(() => {
    console.log('Is Global init? ' + globalContext.state.isInitialized);
    console.log('Is Accounts init? ' + accountsContext.state.isInitialized);
    console.log('Is Chats init? ' + chatsContext.state.isInitialized);

    if (
      !globalContext.state.isInitialized ||
      !accountsContext.state.isInitialized ||
      !chatsContext.state.isInitialized
    ) {
      return;
    }

    (async () => {
      tasks.initPrivateData();

      tasks.createTask(
        accountsContext,
        pricesContext,
        globalContext,
        chatsContext,
      );

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
    globalContext.state.isInitialized,
    accountsContext.state.isInitialized,
    chatsContext.state.isInitialized,
  ]);

  useEffect(() => {
    if (
      !globalContext.state.isUpdatingProfile ||
      !globalContext.state.isInitialized ||
      !accountsContext.state.isInitialized ||
      !chatsContext.state.isInitialized
    ) {
      return;
    }

    backend.myProfile().then(([code, profile]) => {
      console.log('update profile: ' + profile?.lastUpdate);
      if (code === 401) {
        globalContext.dispatch(GlobalStore.signOutFractapp());
      } else if (code === 200) {
        globalContext.dispatch(GlobalStore.setProfile(profile));
      }
      globalContext.dispatch(GlobalStore.setUpdatingProfile(false));
    });
  }, [
    globalContext.state.isUpdatingProfile,
    globalContext.state.isInitialized,
    accountsContext.state.isInitialized,
    chatsContext.state.isInitialized,
  ]);

  useEffect(() => {
    if (netInfo.isConnected !== isConnected) {
      setConnected(netInfo.isConnected ?? false);
    }
  }, [netInfo.isConnected]);

  useEffect(() => {
    if (!globalContext.state.isInitialized) {
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
    if (!globalContext.state.isInitialized) {
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
  }, [isConnected, globalContext.state.isInitialized]);

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
        <Navigation isInitialized={globalContext.state.isInitialized} />
      )}
      <Dialog
        visible={dialogContext.state.visible}
        onPress={
          dialogContext.state.onPress !== undefined
            ? dialogContext.state.onPress!
            : () => console.log('invalid dialog onPress')
        }
        title={dialogContext.state.title}
        text={dialogContext.state.text}
      />
      {isLoading && (
        <View
          style={{
            display: 'flex',
            alignItems: 'stretch',
            position: 'absolute',
            backgroundColor: 'white',
            height: Dimensions.get('window').height,
            width: '100%',
          }}>
          <View
            style={{
              flex: 1,
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
      {globalContext.state.isLoadingShow && (
        <View
          style={{
            display: 'flex',
            alignItems: 'stretch',
            position: 'absolute',
            backgroundColor: 'white',
            height: Dimensions.get('window').height,
            width: '100%',
          }}>
          <Loader />
        </View>
      )}
      {!isLocked &&
        !isLocked &&
        globalContext.state.isSyncShow &&
        globalContext.state.authInfo.isAuthed && (
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
