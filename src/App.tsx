import React, {useState, useEffect, useContext} from 'react';
import SplashScreen from 'react-native-splash-screen';
import {View, Alert, StatusBar} from 'react-native';
import {Dialog, PassCode} from 'components';
import tasks from 'utils/tasks';
import GlobalStore from 'storage/Global';
import DialogStore from 'storage/Dialog';
import {Navigation} from 'screens';
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

export default function App() {
  const globalContext = useContext(GlobalStore.Context);
  const dialogContext = useContext(DialogStore.Context);
  const accountsContext = useContext(AccountsStore.Context);
  const pricesContext = useContext(PricesStore.Context);
  const chatsContext = useContext(ChatsStore.Context);
  const transactionsContext = useContext(TransactionsStore.Context);

  const [isLoading, setLoading] = useState<Boolean>(false);
  const [isLocked, setLocked] = useState<Boolean>(false);
  const [isConnected, setConnected] = useState<Boolean>(true);
  const netInfo = useNetInfo();

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

  useEffect(() => {
    if (isLoading) {
      return;
    }
    console.log('start ' + new Date().toTimeString());
    hideNavigationBar();
    setLoading(true);

    DB.isAuthed().then((isAuthed) => {
      if (!isAuthed) {
        showNavigationBar();
        setLoading(false);
        changeNavigationBarColor('#FFFFFF', true, true);
        SplashScreen.hide();

        console.log('end ' + new Date().toTimeString());
        return;
      }

      tasks.init(
        globalContext,
        accountsContext,
        pricesContext,
        chatsContext,
        transactionsContext,
      );
    });
  }, [globalContext.state.isAuthed]);
  useEffect(() => {
    if (!globalContext.state.isInitialized) {
      return;
    }

    setLocked(globalContext.state.isPasscode);
    tasks
      .createTask(
        globalContext.state.isSynced,
        accountsContext,
        pricesContext,
        globalContext,
        chatsContext,
        transactionsContext,
      )
      .then(() => {
        showNavigationBar();
        setLoading(false);
        changeNavigationBarColor('#FFFFFF', true, true);
        SplashScreen.hide();
        console.log('end ' + new Date().toTimeString());
      });
  }, [globalContext.state.isInitialized]);
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
    return <View />;
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
          isBiometry={globalContext.state.isBiometry}
          isBiometryStart={globalContext.state.isBiometry}
          description={'Enter passcode'}
          onSubmit={onSubmitPasscode}
        />
      ) : (
        <Navigation isInitialized={globalContext.state.isInitialized} />
      )}
      <Dialog
        visible={dialogContext.state.visible}
        onPress={dialogContext.state.onPress}
        title={dialogContext.state.title}
        text={dialogContext.state.text}
      />
    </View>
  );
}
