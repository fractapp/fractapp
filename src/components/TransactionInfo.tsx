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
      color = '#84D371';
      break;
    case TxType.Sent:
      prefix = '-';
      color = '#F45252';
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
              flex: 1,
              flexDirection: 'column-reverse',
              marginLeft: 15,
            }}>
            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 1}}>
                <Text
                  style={[styles.balance, {textAlign: 'left', color: color}]}>
                  {prefix}
                  {transaction.value} {getSymbol(transaction.currency)}
                </Text>
              </View>
            </View>
            <Text numberOfLines={1} style={styles.member}>
              {transaction.member.length <= 10
                ? `${transaction.member}`
                : `${transaction.member.substring(
                    0,
                    13,
                  )}...${transaction.member.substring(
                    transaction.member.length - 13,
                    transaction.member.length,
                  )}`}
            </Text>
          </View>
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
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'black',
  },
  balance: {
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
  },
});
