import React from 'react';
import {StyleSheet, Text, View, TouchableHighlight, Image} from 'react-native';
import {getLogo, getSymbol, Wallet} from 'models/wallet';

/**
 * Component with wallet information
 * @category Components
 */
export const WalletInfo = ({
  wallet,
  onPress,
}: {
  wallet: Wallet;
  onPress: () => void;
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
            <Image source={getLogo(wallet.currency)} style={styles.logo} />
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
                    {wallet.usdValue}$
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
  logo: {
    width: 50,
    height: 50,
    borderRadius: 75,
    overflow: 'hidden',
  },
});
