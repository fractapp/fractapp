import React from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {WalletInfo} from 'components/WalletInfo';
import {Wallet} from 'types/wallet';
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
    const wallets: Array<Wallet> = [];
    for (let [key, account] of Object.entries(accountsState.accounts)) {
      let price = 0;
      if (serverInfo.prices[account.currency]) {
        price = serverInfo.prices[account.currency]!;
      }

      wallets.push(
        new Wallet(
          account.name,
          account.address,
          account.currency,
          account.network,
          account.balance,
          account.planks,
          price,
        ),
      );
    }

    for (let i = 0; i < wallets.length; i++) {
      result.push(
        <WalletInfo
          key={wallets[i].address}
          wallet={wallets[i]}
          onPress={() =>
            navigation.navigate('Send', {
              isEditable: route.params?.isEditable ?? false,
              wallet: wallets[i],
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
