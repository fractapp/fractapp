import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {WalletLogo} from 'components/WalletLogo';
import {getSymbol} from 'types/wallet';
import { Transaction, TxAction, TxStatus, TxType } from 'types/transaction';
import StringUtils from 'utils/string';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getTxName } from 'types/inputs';

/**
 * Payment message in chat
 * @category Components
 */
export const PaymentMsg = ({tx, onPress}: {tx: Transaction, onPress: () => void}) => {
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

  const alignSelf = () => {
    switch (tx.txType) {
      case TxType.Received:
        return 'flex-start';
      case TxType.None:
      case TxType.Sent:
        return 'flex-end';
    }
  };
  const icon = () => {
    switch (tx.txType) {
      case TxType.Received:
        return 'download-outline';
      case TxType.None:
        return 'apps';
      case TxType.Sent:
        return 'upload-outline';
    }
  };
  const text = () => {
    if (tx.action === TxAction.Transfer) {
      switch (tx.txType) {
        case TxType.None:
          return 'Transaction'; //TODO: string
        case TxType.Sent:
          return StringUtils.texts.YouSentTitle;
        case TxType.Received:
          return StringUtils.texts.YouReceivedTitle;
      }
    } else {
      return getTxName(tx.action);
    }
  };
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.message,
        {
          alignSelf: alignSelf(),
        },
      ]}>
      <View style={[styles.cardRow, {marginBottom: 5}]}>
        <MaterialCommunityIcons
          name={icon()}
          size={20}
          color="#888888"
        />
        <Text style={styles.msgText}>
          {text()}
        </Text>
      </View>
      <View style={styles.cardRow}>
        <WalletLogo currency={tx.currency} size={40} />
        <Text style={[styles.usdText, {color: amountColor()}]}>
          {tx.usdValue !== 0
            ? `$${String(tx.usdValue).length < 3 ? tx.usdValue.toFixed(2) : tx.usdValue}`
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  message: {
    minWidth: '48%',
    justifyContent: 'center',
    borderColor: '#DADADA',
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
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
    fontSize: 13,
    color: '#888888',
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
  },
  usdText: {
    marginLeft: 8,
    fontSize: 30,
    color: 'black',
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
  },
  tokenText: {
    marginLeft: 55,
    fontSize: 15,
    color: 'black',
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
  },
  dateText: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
  },
});
