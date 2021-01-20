import React, {useState, useEffect, useContext} from 'react';
import SplashScreen from 'react-native-splash-screen';
import {View, Alert, StatusBar} from 'react-native';
import {Dialog, PassCode} from 'components/index';
import tasks from 'utils/tasks';
import GlobalStore from 'storage/Global';
import DialogStore from 'storage/Dialog';
import {Navigation} from 'screens/index';
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
import TransactionsStore from 'storage/Transactions';
import {Loader} from 'components/Loader';
import backend from 'utils/backend';

export default function App() {
  const globalContext = useContext(GlobalStore.Context);
  const dialogContext = useContext(DialogStore.Context);
  const accountsContext = useContext(AccountsStore.Context);
  const pricesContext = useContext(PricesStore.Context);
  const chatsContext = useContext(ChatsStore.Context);
  const transactionsContext = useContext(TransactionsStore.Context);

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

      await tasks.init(
        globalContext,
        accountsContext,
        pricesContext,
        chatsContext,
        transactionsContext,
      );
    });
  }, [globalContext.state.authInfo.isAuthed]);
  useEffect(() => {
    if (!globalContext.state.isInitialized) {
      return;
    }

    tasks.createTask(
      accountsContext,
      pricesContext,
      globalContext,
      chatsContext,
      transactionsContext,
    );

    tasks.initPrivateData(accountsContext).then(() => {
      if (isBiometry) {
        unlockWithBiometry()
          .then(() => onLoaded())
          .catch(onLoaded);
      } else {
        onLoaded();
      }
      console.log('end ' + new Date().toTimeString());
    });
  }, [globalContext.state.isInitialized]);
  useEffect(() => {
    if (!globalContext.state.isUpdatingProfile) {
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
  }, [globalContext.state.isUpdatingProfile]);
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
    return <Loader />;
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
            ? dialogContext.state.onPress
            : () => console.log('invalid dialog onPress')
        }
        title={dialogContext.state.title}
        text={dialogContext.state.text}
      />
    </View>
  );
}
