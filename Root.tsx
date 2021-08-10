import './shim.js';
import 'locales/i18n';
import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import FlashMessage from 'react-native-flash-message';
import App from './src/App';
import { Provider } from 'react-redux';
import Store from 'storage/Store';

const store = Store.initStore();
export default function Root() {
  return (
    <SafeAreaProvider style={styles.container}>
      <Provider store={store}>
        <App store={store} />
      </Provider>
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
