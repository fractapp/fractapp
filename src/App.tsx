import React, {useContext, useEffect, useState} from 'react';
import SplashScreen from 'react-native-splash-screen';

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  StatusBar,
  View,
  Text,
  NativeModules,
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
    } else {
      showMessage({
        message: 'Incorrect passcode',
        type: 'danger',
        icon: 'warning',
      });
    }
  };
  const onLoaded = () => {
    showNavigationBar();
    setLoading(false);
    console.log('loading off');
    changeNavigationBarColor('#FFFFFF', true, true);
    SplashScreen.hide();
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
      console.log('update profile: ' + profile.lastUpdate);
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
    if (!globalContext.state.isInitialized) {
      return;
    }

    if (netInfo.isConnected && !isConnected) {
      showMessage({
        message: 'Connection restored',
        type: 'success',
        icon: 'success',
        position: 'top',
      });
    }
    if (!netInfo.isConnected) {
      showMessage({
        message: 'Invalid connection',
        type: 'danger',
        icon: 'danger',
        hideOnPress: false,
        autoHide: false,
        position: 'top',
      });
    }

    setConnected(netInfo.isConnected);
  }, [netInfo.isConnected]);

  if (isLoading) {
    return (
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
    );
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
          description={'Enter passcode'}
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
      {globalContext.state.isSyncShow && globalContext.state.authInfo.isAuthed && (
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
            Synchronization
          </Text>
        </View>
      )}
    </View>
  );
}
