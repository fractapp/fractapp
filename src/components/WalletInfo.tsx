import React from 'react';
import {StyleSheet, Text, View, TouchableHighlight} from 'react-native';
import {getSymbol, Wallet} from 'types/wallet';
import {WalletLogo} from 'components/WalletLogo';

/**
 * Component with wallet information
 * @category Components
 */
export const WalletInfo = ({
  wallet,
  onPress,
}: {
  wallet: Wallet;
  onPress?: () => void;
}) => {
  const symbol = getSymbol(wallet.currency);
  return (
    <View style={{width: '100%', justifyContent: 'center'}}>
      <TouchableHighlight
        key={symbol}
        onPress={onPress}
        underlayColor="#f8f9fb">
        <View style={styles.account}>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <WalletLogo currency={wallet.currency} size={50} />
            <View
              style={{
                flex: 1,
                flexDirection: 'column-reverse',
                marginLeft: 20,
              }}>
              <View style={{height: 25, flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                  <Text style={[styles.balance, {textAlign: 'left'}]}>
                    {wallet.balance} {symbol}
                  </Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={[styles.balance, {textAlign: 'right'}]}>
                    ${wallet.usdValue}
                  </Text>
                </View>
              </View>
              <Text style={styles.accountName}>{wallet.name}</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    </View>
  );
};

const styles = StyleSheet.create({
  account: {
    height: 50,
    paddingLeft: '5%',
    width: '95%',
    marginTop: 10,
    marginBottom: 10,
  },
  accountName: {
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    lineHeight: 18,
    color: 'black',
  },
  balance: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    fontStyle: 'normal',
    lineHeight: 18,
    color: 'black',
  },
});
