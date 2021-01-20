import React from 'react';
import {StyleSheet, Text, View, TouchableHighlight, Image} from 'react-native';
import {Currency, getSymbol, Wallet} from 'models/wallet';
import {WalletLogo} from 'components/WalletLogo';

/**
 * @category Components
 */
export enum ReceiverType {
  Standard,
  Fractapp,
}
export const Receiver = ({
  currency,
  nameOrAddress,
  type,
}: {
  currency: Currency;
  nameOrAddress: string;
  type: ReceiverType;
}) => {
  return (
    <View style={{width: '100%', alignContent: 'center'}}>
      <View style={styles.account}>
        <View style={{flex: 1, flexDirection: 'row'}}>
          {type === ReceiverType.Standard ? (
            <WalletLogo currency={currency} size={50} />
          ) : (
            <WalletLogo currency={currency} size={50} />
          )}
          <View
            style={{
              flex: 1,
              marginLeft: 20,
              justifyContent: 'center',
              alignContent: 'center',
            }}>
            <Text maxFontSizeMultiplier={2} style={styles.accountName}>
              {nameOrAddress}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  account: {
    height: 50,
    paddingLeft: '5%',
    width: '95%',
    marginTop: 10,
  },
  accountName: {
    width: '100%',
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    lineHeight: 18,
    color: 'black',
  },
});
