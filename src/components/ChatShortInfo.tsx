import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {WalletLogo} from 'components/WalletLogo';
import {Currency, getSymbol} from 'models/wallet';
import {Transaction, TxType} from 'models/transaction';
import dateUtils from 'utils/date';

/**
 * @category Components
 */
export const ChatShortInfo = ({
  address,
  notificationCount,
  tx,
}: {
  address: string;
  notificationCount: number;
  tx: Transaction;
}) => {
  const now = new Date();
  return (
    <View style={styles.account}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: '4%',
          marginRight: '3%',
        }}>
        <WalletLogo currency={tx.currency} size={60} />
        <View style={{flex: 1, flexDirection: 'column', marginLeft: 10}}>
          <View style={{height: 25, flexDirection: 'row'}}>
            <View style={{flex: 4}}>
              <Text style={[styles.name, {textAlign: 'left'}]}>
                {address.length <= 20
                  ? `${address}`
                  : `${address.substring(0, 12)}...${address.substring(
                      address.length - 12,
                      address.length,
                    )}`}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={[styles.time, {textAlign: 'right'}]}>
                {dateUtils.toChatInfo(now, new Date(tx.timestamp))}
              </Text>
            </View>
          </View>
          <View style={{height: 25, flexDirection: 'row'}}>
            <View style={{flex: 8}}>
              <Text style={[styles.msg, {textAlign: 'left'}]}>
                {tx.txType == TxType.Sent
                  ? `Sent -$${tx.usdValue} (${tx.value} ${getSymbol(
                      tx.currency,
                    )})`
                  : `Received +$${tx.usdValue} (${tx.value} ${getSymbol(
                      tx.currency,
                    )})`}
              </Text>
            </View>
            <View style={{flex: 1, alignItems: 'flex-end'}}>
              <View style={styles.notification}>
                {notificationCount != 0 ? (
                  <Text style={[styles.notificationText]}>
                    {notificationCount}
                  </Text>
                ) : (
                  <View />
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  account: {
    height: 80,
    width: '100%',
  },
  name: {
    fontSize: 15,
    fontFamily: 'RobotoBold',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'black',
  },
  msg: {
    fontSize: 15,
    fontFamily: 'RobotoRegular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: '#888888',
  },
  time: {
    fontSize: 13,
    fontFamily: 'RobotoRegular',
    fontStyle: 'normal',
    color: '#888888',
  },
  notification: {
    backgroundColor: '#C4C4C4',
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 20,
  },
  notificationText: {
    fontSize: 13,
    fontFamily: 'RobotoRegular',
    fontStyle: 'normal',
    color: 'white',
  },
});
