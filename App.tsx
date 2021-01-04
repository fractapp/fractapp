import './shim.js';
import React, {useState, useEffect, useReducer} from 'react';
import SplashScreen from 'react-native-splash-screen';
import {StyleSheet, StatusBar, View, Alert} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import FlashMessage from 'react-native-flash-message';
import {Dialog, PassCode} from 'components';
import tasks from 'utils/tasks';
import AuthStore from 'storage/Auth';
import DialogStore from 'storage/Dialog';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/Prices';
import {Navigation} from 'screens';
import {
  hideNavigationBar,
  showNavigationBar,
} from 'react-native-navigation-bar-color';
import PasscodeUtil from 'utils/passcode';
import {showMessage} from 'react-native-flash-message';
import DB from 'utils/db';

export default function App() {
  const [authStore, authDispatch] = useReducer(
    AuthStore.reducer,
    AuthStore.initialState,
  );
  const [dialogStore, dialogDispatch] = useReducer(
    DialogStore.reducer,
    DialogStore.initialState,
  );
  const [accountsStore, accountsDispatch] = useReducer(
    AccountsStore.reducer,
    AccountsStore.initialState,
  );
  const [pricesStore, pricesDispatch] = useReducer(
    PricesStore.reducer,
    PricesStore.initialState,
  );

  const [isLoading, setLoading] = useState<Boolean>(true);
  const [isWalletCreated, setWalletCreated] = useState<Boolean>(false);
  const [isLocked, setLocked] = useState<Boolean>(false);
  const [isBiometry, setBiometry] = useState<Boolean>(false);

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
    if (isWalletCreated) {
      return;
    }

    console.log('start ' + new Date().toTimeString());

    hideNavigationBar();
    setLoading(true);

    DB.isSigned().then(async (isSigned) => {
      if (isSigned) {
        setLocked(await DB.isPasscode());
        setBiometry(await DB.isBiometry());

        setWalletCreated(true);
        authDispatch(AuthStore.signIn());

        await tasks.initAccounts(accountsDispatch);
        await tasks.createTask(accountsDispatch, pricesDispatch);
      }

      showNavigationBar();
      setLoading(false);
      SplashScreen.hide();

      console.log('end ' + new Date().toTimeString());
    });
  }, [authStore.isSign]);

  if (
    dialogStore == undefined ||
    authStore == undefined ||
    accountsStore == undefined ||
    pricesStore == undefined
  ) {
    Alert.alert('Please contact support: support@fractapp.com');
    return <View />;
  }

  if (isLoading) {
    return <View />;
  }

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar
        backgroundColor={styles.container.backgroundColor}
        barStyle={'dark-content'}
        hidden={false}
      />
      <DialogStore.Context.Provider
        value={{dialog: dialogStore.dialog, dispatch: dialogDispatch}}>
        <AuthStore.Context.Provider
          value={{isSign: authStore.isSign, dispatch: authDispatch}}>
          <AccountsStore.Context.Provider
            value={{
              accounts: accountsStore.accounts,
              dispatch: accountsDispatch,
            }}>
            <PricesStore.Context.Provider
              value={{prices: pricesStore.prices, dispatch: pricesDispatch}}>
              {isLocked ? (
                <PassCode
                  isBiometry={isBiometry}
                  isBiometryStart={isBiometry}
                  description={'Enter passcode'}
                  onSubmit={onSubmitPasscode}
                />
              ) : (
                <Navigation isWalletCreated={isWalletCreated} />
              )}
            </PricesStore.Context.Provider>
          </AccountsStore.Context.Provider>
        </AuthStore.Context.Provider>

        <Dialog
          visible={dialogStore.dialog.visible}
          onPress={dialogStore.dialog.onPress}
          title={dialogStore.dialog.title}
          text={dialogStore.dialog.text}
        />
      </DialogStore.Context.Provider>
      <FlashMessage position="bottom" />
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
});
