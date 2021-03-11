import React, {useContext} from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {WalletInfo} from 'components/WalletInfo';
import {Wallet} from 'types/wallet';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/Prices';

export const SelectWallet = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const accountsContext = useContext(AccountsStore.Context);
  const priceContext = useContext(PricesStore.Context);

  const renderAccounts = () => {
    const result = [];
    const wallets = new Array<Wallet>();
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
