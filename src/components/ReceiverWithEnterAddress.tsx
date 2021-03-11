import React from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import {Currency} from 'types/wallet';
import {WalletLogo} from 'components/WalletLogo';

/**
 * @category Components
 */
export const ReceiverWithEnterAddress = ({
  value,
  isValid,
  currency,
  onOk,
  onChangeText,
}: {
  value: string;
  isValid: boolean;
  currency: Currency;
  onOk: () => void;
  onChangeText: (text: string) => void;
}) => {
  const getBorderColor = () => {
    if (isValid) {
      return '#67D44D';
    } else if (!isValid && value.length > 0) {
      return '#EA4335';
    } else {
      return '#DADADA';
    }
  };
  return (
    <View style={{width: '100%', alignContent: 'center'}}>
      <View style={styles.account}>
        <View style={{flex: 1, flexDirection: 'row'}}>
          <WalletLogo currency={currency!} size={50} />
          <View
            style={{
              flex: 1,
              marginLeft: 20,
              justifyContent: 'center',
              alignContent: 'center',
            }}>
            <TextInput
              value={value}
              onChangeText={onChangeText}
              onEndEditing={onOk}
              style={[styles.accountName, {borderColor: getBorderColor()}]}
              placeholder={'Enter address'}
            />
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
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 8,
    paddingTop: 8,

    width: '100%',
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'black',
    borderBottomWidth: 1,
  },
});
