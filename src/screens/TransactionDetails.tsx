import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {Transaction, TxType} from 'models/transaction';
import {getSymbol, Wallet} from 'models/wallet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {WalletInfo, WalletLogo} from 'components';

export const TransactionDetails = ({route}: {route: any}) => {
  const tx: Transaction = route.params.transaction;
  const wallet: Wallet = route.params.wallet;

  let color: string;
  switch (tx.txType) {
    case TxType.None:
      color = '#888888';
      break;
    case TxType.Received:
      color = '#67D44D';
      break;
    case TxType.Sent:
      color = '#EA4335';
      break;
  }

  return (
    <View style={{flexDirection: 'column', flex: 1, alignItems: 'center'}}>
      <View style={styles.info}>
        <WalletLogo currency={tx.currency} size={80} />
        <Text style={styles.address}>{tx.member}</Text>
        <Text style={[styles.value, {color: color}]}>
          {tx.usdValue != 0
            ? '$' + tx.usdValue
            : `${tx.value} ${getSymbol(tx.currency)}`}
        </Text>
        {tx.usdValue != 0 ? (
          <Text style={styles.subValue}>
            ({tx.value} {getSymbol(tx.currency)})
          </Text>
        ) : (
          <View />
        )}
        <View style={styles.status}>
          <MaterialIcons name="done" size={25} color="#888888" />
          <Text style={styles.statusText}>Success</Text>
        </View>
      </View>

      <View style={{width: '100%', marginTop: 30}}>
        <Text style={[styles.title, {marginBottom: 10}]}>
          Write-off account
        </Text>
        <WalletInfo wallet={wallet} />
      </View>

      <View style={{width: '100%', flexDirection: 'row', marginTop: 20}}>
        <View style={{flex: 1}}>
          <Text style={[styles.title, {marginBottom: 5}]}>Date</Text>
          <Text style={styles.dateAndFee}>
            {new Date(tx.timestamp).toLocaleDateString()}{' '}
            {new Date(tx.timestamp).toLocaleTimeString()}
          </Text>
        </View>
        <View style={{flex: 1, alignItems: 'flex-end'}}>
          <View>
            <Text style={[styles.title, {marginBottom: 5}]}>Fee</Text>
            {tx.usdFee == 0 ? (
              <Text style={styles.dateAndFee}>{tx.fee} DOT</Text>
            ) : (
              <Text style={styles.dateAndFee}>${tx.usdFee}</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  info: {
    width: '90%',
    marginTop: 20,
    paddingTop: 30,
    paddingBottom: 30,
    borderColor: '#888888',
    borderWidth: 0.5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  address: {
    width: '80%',
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: 'black',
  },
  value: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 40,
    fontFamily: 'Roboto-Regular',
    color: 'black',
  },
  subValue: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Roboto-Regular',
    color: 'black',
  },
  status: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontFamily: 'Roboto-Regular',
    color: '#888888',
  },
  title: {
    marginLeft: 20,
    marginRight: 20,
    alignSelf: 'flex-start',
    fontSize: 18,
    fontFamily: 'Roboto-Regular',
    color: '#888888',
  },
  dateAndFee: {
    marginLeft: 20,
    marginRight: 20,
    alignSelf: 'flex-start',
    fontSize: 18,
    fontFamily: 'Roboto-Regular',
    color: 'black',
  },
});
