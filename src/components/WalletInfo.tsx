import React from 'react';
import {StyleSheet, Text, View, TouchableHighlight} from 'react-native';
import {getSymbol} from 'types/wallet';
import {WalletLogo} from 'components/WalletLogo';
import { Account } from 'types/account';
import MathUtils from 'utils/math';

/**
 * Component with wallet information
 * @category Components
 */
export const WalletInfo = ({
  account,
  price,
  onPress,
  width = '95%',
  paddingLeft = '5%',
}: {
  account: Account;
  price: number | undefined,
  onPress?: () => void;
  width?: string,
  paddingLeft?: string,
}) => {
  const symbol = getSymbol(account.currency);
  return (
    <View style={{width: '100%', justifyContent: 'center'}}>
      <TouchableHighlight
        key={symbol}
        onPress={onPress}
        underlayColor="#f8f9fb">
        <View style={[styles.account, {
          paddingLeft: paddingLeft,
          width: width,
        }]}>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <WalletLogo currency={account.currency} size={50} />
            <View
              style={{
                flex: 1,
                flexDirection: 'column-reverse',
                marginLeft: 20,
              }}>
              <View style={{height: 25, flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                  <Text style={[styles.balance, {textAlign: 'left'}]}>
                    {account.balance} {symbol}
                  </Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={[styles.balance, {textAlign: 'right'}]}>
                    ${price !== undefined ? MathUtils.roundUsd(account.balance * price) : 0}
                  </Text>
                </View>
              </View>
              <Text style={styles.accountName}>{account.name}</Text>
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
