import React from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {Currency} from 'types/wallet';
import {WalletLogo} from 'components/WalletLogo';

/**
 * Component with receiver information
 * @category Components
 */
export enum ReceiverType {
  Address,
  User,
}

/**
 * @category Components
 */
export const Receiver = ({
  nameOrAddress,
  type,
  currency = undefined,
  avatar = null,
}: {
  nameOrAddress: string;
  type: ReceiverType;
  currency?: Currency;
  avatar?: any;
}) => {
  return (
    <View style={{width: '100%', alignContent: 'center'}}>
      <View style={styles.account}>
        <View style={{flex: 1, flexDirection: 'row'}}>
          {type === ReceiverType.Address ? (
            <WalletLogo currency={currency!} size={50} />
          ) : (
            <Image
              source={avatar}
              width={50}
              height={50}
              style={{width: 50, height: 50, borderRadius: 25}}
            />
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
