import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {WalletLogo} from 'components/WalletLogo';
import {getSymbol} from 'types/wallet';
import {Transaction, TxType} from 'types/transaction';
import stringUtils from 'utils/string';
import {UserProfile} from 'types/profile';
import backend from 'utils/backend';

/**
 * Short chat information
 * @category Components
 */
export const ChatShortInfo = ({
  name,
  notificationCount,
  tx,
  user,
}: {
  name: string;
  notificationCount: number;
  tx: Transaction;
  user: UserProfile | null;
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
        {user != null ? (
          <Image
            source={{
              uri: backend.getImgUrl(user.id, user.avatarExt, user.lastUpdate),
            }}
            width={55}
            height={55}
            style={{width: 55, height: 55, borderRadius: 30}}
          />
        ) : (
          <WalletLogo currency={tx.currency} size={55} />
        )}

        <View style={{flex: 1, flexDirection: 'column', marginLeft: 10}}>
          <View style={{height: 25, flexDirection: 'row'}}>
            <View style={{flex: 3}}>
              <Text style={[styles.name, {textAlign: 'left'}]}>
                {stringUtils.formatNameOrAddress(name)}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={[styles.time, {textAlign: 'right'}]}>
                {stringUtils.forChatInfo(now, new Date(tx.timestamp))}
              </Text>
            </View>
          </View>
          <View style={{height: 23, flexDirection: 'row'}}>
            <View style={{flex: 8}}>
              <Text style={[styles.msg, {textAlign: 'left'}]}>
                {tx.txType === TxType.Sent
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
                {notificationCount !== 0 ? (
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
    height: 75,
    width: '100%',
  },
  name: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'black',
  },
  msg: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: '#888888',
  },
  time: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
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
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    color: 'white',
  },
});
