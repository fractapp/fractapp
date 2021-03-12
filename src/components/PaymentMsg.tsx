import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {WalletLogo} from 'components/WalletLogo';
import {getSymbol} from 'types/wallet';
import {Transaction, TxStatus, TxType} from 'types/transaction';
import StringUtils from 'utils/string';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MathUtils from 'utils/math';

/**
 * Payment message in chat
 * @category Components
 */
export const PaymentMsg = ({tx}: {tx: Transaction}) => {
  const now = new Date();

  const renderStatus = () => {
    switch (tx.status) {
      case TxStatus.Success:
        return (
          <MaterialIcons
            name="done"
            size={20}
            color="#67D44D"
            style={styles.status}
          />
        );
      case TxStatus.Pending:
        return (
          <MaterialIcons
            name="schedule"
            size={20}
            color="#F39B34"
            style={styles.status}
          />
        );
      case TxStatus.Fail:
        return (
          <MaterialCommunityIcons
            name="close"
            size={20}
            color="#EA4335"
            style={styles.status}
          />
        );
    }
  };
  const amountColor = () => {
    if (tx.status === TxStatus.Fail || tx.txType === TxType.None) {
      return '#888888';
    }
    if (tx.txType === TxType.Sent) {
      return '#EA4335';
    } else if (tx.txType === TxType.Received) {
      return '#67D44D';
    }
  };
  return (
    <View
      style={[
        styles.message,
        {
          alignSelf: tx.txType === TxType.Sent ? 'flex-end' : 'flex-start',
        },
      ]}>
      <View style={[styles.cardRow, {marginBottom: 5}]}>
        <MaterialCommunityIcons
          name={
            tx.txType === TxType.Sent ? 'upload-outline' : 'download-outline'
          }
          size={20}
          color="#888888"
        />
        <Text style={styles.msgText}>
          {tx.txType === TxType.Sent ? 'You sent' : 'You received'}
        </Text>
      </View>
      <View style={styles.cardRow}>
        <WalletLogo currency={tx.currency} size={45} />
        <Text style={[styles.usdText, {color: amountColor()}]}>
          {tx.usdValue !== 0
            ? `$${MathUtils.floorUsd(tx.usdValue)}`
            : `${tx.value} ${getSymbol(tx.currency)}`}
        </Text>
      </View>

      {tx.usdValue !== 0 ? (
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

        <View style={{flex: 1}}>{renderStatus()}</View>
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
  status: {
    marginLeft: 3,
    alignSelf: 'flex-end',
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
