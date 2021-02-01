import React, {useContext} from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {WalletInfo} from 'components/index';
import {Wallet} from 'models/wallet';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/Prices';

export const SelectWallet = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const accountContext = useContext(AccountsStore.Context);
  const priceContext = useContext(PricesStore.Context);

  const renderAccounts = () => {
    const result = [];
    const wallets = new Array<Wallet>();
    for (let [currency, account] of accountContext.state) {
      let price = priceContext.state.get(currency);
      if (price === undefined) {
        price = 0;
      }

      wallets.push(
        new Wallet(
          account.name,
          account.address,
          account.currency,
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
              wallet: wallets[i],
              chatInfo: route.params.chatInfo,
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
