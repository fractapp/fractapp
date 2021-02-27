import React, {useContext} from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {StatisticsBar} from 'components/StatisticsBar';
import {WalletInfo} from 'components/WalletInfo';
import {Wallet, Currency} from 'types/wallet';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/Prices';

export const Wallets = ({navigation}: {navigation: any}) => {
  const accountsContext = useContext(AccountsStore.Context);
  const priceContext = useContext(PricesStore.Context);

  const renderAccounts = () => {
    const result = new Array();
    const wallets = new Array<Wallet>();
    for (let [currency, account] of accountsContext.state.accounts) {
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
            navigation.navigate('WalletDetails', {wallet: wallets[i]})
          }
        />,
      );
    }
    return result;
  };

  const distribution = () => {
    let distribution = new Map<Currency, number>();

    for (let [currency, account] of accountsContext.state.accounts) {
      let price = priceContext.state.get(currency);
      if (price == undefined) {
        price = 0;
      }

      distribution.set(currency, account.balance * price);
    }
    return distribution;
  };

  return (
    <View style={styles.wallet}>
      <ScrollView showsVerticalScrollIndicator={false} style={{width: '100%'}}>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <StatisticsBar distribution={distribution()} />
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
    marginTop: 30,
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
