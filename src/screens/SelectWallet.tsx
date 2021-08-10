import React from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {WalletInfo} from 'components/WalletInfo';
import AccountsStore from 'storage/Accounts';
import { useSelector } from 'react-redux';
import ServerInfoStore from 'storage/ServerInfo';

/**
 * Select wallet screen
 * @category Screens
 */
export const SelectWallet = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const accountsState: AccountsStore.State = useSelector((state: any) => state.accounts);
  const serverInfo: ServerInfoStore.State = useSelector((state: any) => state.serverInfo);

  const renderAccounts = () => {
    const result = [];
    for (let [key, account] of Object.entries(accountsState.accounts)) {
      let price = 0;
      if (serverInfo.prices[account.currency]) {
        price = serverInfo.prices[account.currency]!;
      }

      result.push(
        <WalletInfo
          key={account.address}
          account={account}
          price={price}
          onPress={() =>
            navigation.navigate('Send', {
              isEditable: route.params?.isEditable ?? false,
              currency: account.currency,
              chatInfo: route.params?.chatInfo,
            })
          }
        />,
      );
    }

    return result;
  };

  return (
    <View style={styles.wallet}>
      <ScrollView showsVerticalScrollIndicator={false} style={{width: '100%'}}>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <View style={styles.accounts}>{renderAccounts()}</View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wallet: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accounts: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividingLine: {
    width: '80%',
    marginBottom: 10,
    marginTop: 10,
    height: 1,
    backgroundColor: '#ededed',
  },
});
