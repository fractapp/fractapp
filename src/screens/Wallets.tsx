import React from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {StatisticsBar} from 'components/StatisticsBar';
import {WalletInfo} from 'components/WalletInfo';
import {Currency} from 'types/wallet';
import AccountsStore from 'storage/Accounts';
import { useSelector } from 'react-redux';
import ServerInfoStore from 'storage/ServerInfo';
import { Account, AccountType } from 'types/account';

/**
 * Screen with all wallets
 * @category Screens
 */
export const Wallets = ({navigation}: {navigation: any}) => {
  const accountState: AccountsStore.State = useSelector((state: any) => state.accounts);
  const serverInfoState: ServerInfoStore.State = useSelector((state: any) => state.serverInfo);

  const accounts: Array<Account> = Object.entries(accountState.accounts[AccountType.Main]).map((value: [string, Account]) => value[1]);

  const renderAccounts = () => {
    const result = [];

    for (let account of accounts) {
      let price = 0;
      if (serverInfoState.prices[account.currency]) {
        price = serverInfoState.prices[account.currency]!;
      }

      result.push(
        <WalletInfo
          key={account.address}
          account={account}
          price={price}
          onPress={() =>
            navigation.navigate('WalletDetails', { currency: account.currency, type: account.type })
          }
        />
      );
    }

    if (accountState.accounts[AccountType.Staking] === undefined) {
      return result;
    }
    for (let keyValue of Object.entries(accountState.accounts[AccountType.Staking])) {
      const subAccount = keyValue[1];
      let price = 0;
      if (serverInfoState.prices[subAccount.currency]) {
        price = serverInfoState.prices[subAccount.currency]!;
      }

      result.push(
        <WalletInfo
          key={String(AccountType.Staking) + '-' + subAccount.address}
          account={subAccount}
          price={price}
          onPress={() =>
            navigation.navigate('WalletDetails', { currency: subAccount.currency, type: subAccount.type })
          }
        />
      );
    }

    return result;
  };

  const distribution = () => {
    let distribution = new Map<Currency, number>();

    for (let account of accounts) {
      let price = 0;
      let stakingValue = accountState.accounts[AccountType.Staking] !== undefined
        && accountState.accounts[AccountType.Staking][account.currency] !== undefined ?
        accountState.accounts[AccountType.Staking][account.currency].viewBalance : 0;

      if (serverInfoState.prices[account.currency]) {
        price = serverInfoState.prices[account.currency]!;
      }

      distribution.set(account.currency, (account.viewBalance + stakingValue) * price);
    }
    return distribution;
  };

  return (
    <View style={styles.wallet}>
      <ScrollView showsVerticalScrollIndicator={false} style={{width: '100%'}}>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <StatisticsBar
            distribution={distribution()}
            onPress={() =>
              navigation.navigate('WalletDetailsGraph')
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
