import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {getSymbol, Wallet} from 'models/wallet';
import {WalletLogo} from 'components/WalletLogo';

/**
 * Component with wallet information for details screen
 * @category Components
 */
export const WalletDetailsInfo = ({wallet}: {wallet: Wallet}) => {
  return (
    <View style={styles.accountInfo}>
      <View style={{flex: 1, flexDirection: 'row'}}>
        <WalletLogo currency={wallet.currency} size={50} />
        <View
          style={{
            flex: 1,
            alignSelf: 'center',
            marginLeft: 15,
          }}>
          <Text style={styles.name}>{wallet.name}</Text>
          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1}}>
              <Text style={[styles.balance, {textAlign: 'left'}]}>
                {wallet.balance} {getSymbol(wallet.currency)}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={[styles.balance, {textAlign: 'right'}]}>
                ${wallet.usdValue}
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
