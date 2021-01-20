import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {WalletLogo} from 'components/WalletLogo';
import {getSymbol} from 'models/wallet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Transaction, TxType} from 'models/transaction';
import StringUtils from 'utils/string';

/**
 * @category Components
 */
export const PaymentMsg = ({tx}: {tx: Transaction}) => {
  const now = new Date();

  return (
    <View
      style={[
        styles.message,
        {
          alignSelf: tx.txType == TxType.Sent ? 'flex-end' : 'flex-start',
        },
      ]}>
      <View style={[styles.cardRow, {marginBottom: 5}]}>
        <MaterialCommunityIcons
          name={
            tx.txType == TxType.Sent ? 'upload-outline' : 'download-outline'
          }
          size={20}
          color="#888888"
        />
        <Text style={styles.msgText}>
          {tx.txType == TxType.Sent ? 'You sent' : 'You received'}
        </Text>
      </View>
      <View style={styles.cardRow}>
        <WalletLogo currency={tx.currency} size={45} />
        <Text
          style={[
            styles.usdText,
            {color: tx.txType == TxType.Sent ? '#EA4335' : '#67D44D'},
          ]}>
          {tx.usdValue != 0
            ? `$${tx.usdValue.toFixed(2)}`
            : `${tx.value} ${getSymbol(tx.currency)}`}
        </Text>
      </View>

      {tx.usdValue != 0 ? (
        <Text style={[styles.tokenText]}>
          {tx.value} {getSymbol(tx.currency)}
        </Text>
      ) : (
        <View />
      )}
      <View style={[styles.cardRow, {marginTop: 10}]}>
        <Text
          style={[styles.dateText, {marginLeft: 3, alignSelf: 'flex-start'}]}>
          {StringUtils.toMsg(now, new Date(tx.timestamp))}
        </Text>

        <View style={{flex: 1}}>
          <MaterialIcons
            name="done"
            size={20}
            color="#67D44D"
            style={{marginLeft: 3, alignSelf: 'flex-end'}}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  message: {
    minWidth: '48%',
    marginLeft: 20,
    marginRight: 20,
    justifyContent: 'center',
    borderColor: '#DADADA',
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    paddingRight: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  msgText: {
    marginLeft: 3,
    fontSize: 15,
    color: '#888888',
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
  },
  usdText: {
    marginLeft: 10,
    fontSize: 35,
    color: 'black',
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
  },
  tokenText: {
    marginLeft: 60,
    fontSize: 18,
    color: 'black',
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
  },
  statusText: {
    fontSize: 15,
    color: '#888888',
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
  },
  dateText: {
    fontSize: 13,
    color: '#888888',
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
  },
});
