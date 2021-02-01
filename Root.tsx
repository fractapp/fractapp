import './shim.js';
import React, {useReducer} from 'react';
import {StyleSheet, View, Alert} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import FlashMessage from 'react-native-flash-message';
import GlobalStore from 'storage/Global';
import DialogStore from 'storage/Dialog';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/Prices';
import TransactionsStore from 'storage/Transactions';
import ChatsStore from 'storage/Chats';
import App from './src/App';

export default function Root() {
  const [globalStore, globalDispatch] = useReducer(
    GlobalStore.reducer,
    GlobalStore.initialState,
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
  const [chatsStore, chatsDispatch] = useReducer(
    ChatsStore.reducer,
    ChatsStore.initialState,
  );
  const [transactionsStore, transactionsDispatch] = useReducer(
    TransactionsStore.reducer,
    TransactionsStore.initialState,
  );

  if (
    dialogStore == undefined ||
    accountsStore == undefined ||
    pricesStore == undefined ||
    transactionsStore == null
  ) {
    Alert.alert('Please contact support: support@fractapp.com');
    return <View />;
  }

  return (
    <SafeAreaProvider style={styles.container}>
      <DialogStore.Context.Provider
        value={{state: dialogStore, dispatch: dialogDispatch}}>
        <GlobalStore.Context.Provider
          value={{state: globalStore, dispatch: globalDispatch}}>
          <AccountsStore.Context.Provider
            value={{state: accountsStore, dispatch: accountsDispatch}}>
            <ChatsStore.Context.Provider
              value={{
                state: chatsStore,
                dispatch: chatsDispatch,
              }}>
              <TransactionsStore.Context.Provider
                value={{
                  state: transactionsStore,
                  dispatch: transactionsDispatch,
                }}>
                <PricesStore.Context.Provider
                  value={{state: pricesStore, dispatch: pricesDispatch}}>
                  <App />
                </PricesStore.Context.Provider>
              </TransactionsStore.Context.Provider>
            </ChatsStore.Context.Provider>
          </AccountsStore.Context.Provider>
        </GlobalStore.Context.Provider>
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
