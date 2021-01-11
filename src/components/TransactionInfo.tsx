import React from 'react';
import {StyleSheet, View, Text, TouchableHighlight} from 'react-native';
import {Transaction, TxType} from '../models/transaction';
import {getSymbol} from '../models/wallet';
import {WalletLogo} from 'components/WalletLogo';

/**
 * Component with transaction information
 * @category Components
 */
export const TransactionInfo = ({
  transaction,
  onPress,
}: {
  transaction: Transaction;
  onPress: () => void;
}) => {
  let prefix: string;
  let color: string;
  switch (transaction.txType) {
    case TxType.None:
      prefix = '';
      color = '#888888';
      break;
    case TxType.Received:
      prefix = '+';
      color = '#67D44D';
      break;
    case TxType.Sent:
      prefix = '-';
      color = '#EA4335';
      break;
  }

  return (
    <TouchableHighlight
      onPress={onPress}
      key={transaction.id}
      underlayColor="#f8f9fb"
      style={styles.transaction}>
      <View style={{width: '90%'}}>
        <View style={{flex: 1, flexDirection: 'row'}}>
          <WalletLogo currency={transaction.currency} size={50} />
          <View
            style={{
              alignSelf: 'center',
              flex: 1,
              flexDirection: 'column',
              marginLeft: 10,
            }}>
            <Text numberOfLines={1} style={styles.member}>
              {transaction.member.length <= 10
                ? `${transaction.member}`
                : `${transaction.member.substring(
                    0,
                    10,
                  )}...${transaction.member.substring(
                    transaction.member.length - 10,
                    transaction.member.length,
                  )}`}
            </Text>
            <Text style={[styles.balance, {textAlign: 'left', color: color}]}>
              {prefix}
              {transaction.value} {getSymbol(transaction.currency)}
            </Text>
          </View>
          {transaction.usdValue != 0 ? (
            <Text style={[styles.balance, {alignSelf: 'center', color: color}]}>
              {prefix}${transaction.usdValue}
            </Text>
          ) : (
            <View />
          )}
        </View>
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  transaction: {
    paddingTop: 10,
    paddingBottom: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  member: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'black',
  },
  balance: {
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
  },
});
