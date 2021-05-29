import React, {useContext} from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {StatisticsBar} from 'components/StatisticsBar';
import {WalletInfo} from 'components/WalletInfo';
import {Wallet, Currency} from 'types/wallet';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/Prices';

/**
 * Screen with all wallets
 * @category Screens
 */
export const Wallets = ({navigation}: {navigation: any}) => {
  const accountsContext = useContext(AccountsStore.Context);
  const priceContext = useContext(PricesStore.Context);
  const wallets = new Array<Wallet>();
  const renderAccounts = () => {
    const result = new Array();

    for (let [currency, account] of accountsContext.state.accounts) {
      let price = 0;
      if (priceContext.state.has(currency)) {
        price = priceContext.state.get(currency)!;
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
      let price = 0;
      if (priceContext.state.has(currency)) {
        price = priceContext.state.get(currency)!;
      }

      distribution.set(currency, account.balance * price);
    }
    return distribution;
  };

  return (
    <View style={styles.wallet}>
      <ScrollView showsVerticalScrollIndicator={false} style={{width: '100%'}}>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <StatisticsBar
            distribution={distribution()}
            wallets={wallets}
            onPress={() =>
              navigation.navigate('WalletDetailsGraph', {wallets: wallets})
            }
          />
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
