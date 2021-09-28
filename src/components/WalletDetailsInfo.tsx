import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {getSymbol} from 'types/wallet';
import {WalletLogo} from 'components/WalletLogo';
import { Account } from 'types/account';
import MathUtils from 'utils/math';

/**
 * Component with wallet information for details screen
 * @category Components
 */
export const WalletDetailsInfo = ({account, price}: {account: Account, price: number | undefined}) => {
  return (
    <View style={styles.accountInfo}>
      <View style={{flex: 1, flexDirection: 'row'}}>
        <WalletLogo currency={account.currency} size={50} />
        <View
          style={{
            flex: 1,
            alignSelf: 'center',
            marginLeft: 15,
          }}>
          <Text style={styles.name}>{account.name}</Text>
          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1}}>
              <Text style={[styles.balance, {textAlign: 'left'}]}>
                {account.viewBalance} {getSymbol(account.currency)}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={[styles.balance, {textAlign: 'right'}]}>
                ${price !== undefined ? MathUtils.roundUsd(account.viewBalance * price) : 0}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  accountInfo: {
    marginTop: 15,
    alignSelf: 'center',
    width: '85%',
  },
  name: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: '#888888',
  },
  balance: {
    fontSize: 23,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    color: 'black',
  },
});
