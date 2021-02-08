import React from 'react';
import {StyleSheet, View, Text, TouchableHighlight, Image} from 'react-native';
import {Transaction, TxStatus, TxType} from '../models/transaction';
import {getSymbol} from '../models/wallet';
import {WalletLogo} from 'components/WalletLogo';
import stringUtils from 'utils/string';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {UserProfile} from 'models/profile';
import backend from 'utils/backend';

/**
 * Component with transaction information
 * @category Components
 */
export const TransactionInfo = ({
  transaction,
  user,
  onPress,
}: {
  transaction: Transaction;
  user: UserProfile | null;
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

  const renderStatus = () => {
    switch (transaction.status) {
      case TxStatus.Pending:
        return (
          <View style={styles.status}>
            <MaterialIcons name="schedule" size={23} color="#F39B34" />
          </View>
        );
      case TxStatus.Fail:
        return (
          <View
            style={[styles.status, {borderColor: '#EA4335', borderWidth: 1}]}>
            <MaterialCommunityIcons name="close" size={20} color="#EA4335" />
          </View>
        );
    }
  };

  return (
    <TouchableHighlight
      onPress={onPress}
      key={transaction.id}
      underlayColor="#f8f9fb"
      style={styles.transaction}>
      <View style={{width: '90%'}}>
        <View style={{flex: 1, flexDirection: 'row'}}>
          {user != null ? (
            <Image
              source={
                user.avatarExt === ''
                  ? require('assets/img/default-avatar.png')
                  : {
                      uri: backend.getImgUrl(
                        user.id,
                        user.avatarExt,
                        user.lastUpdate,
                      ),
                    }
              }
              width={50}
              height={50}
              style={{width: 50, height: 50, borderRadius: 25}}
            />
          ) : (
            <WalletLogo currency={transaction.currency} size={50} />
          )}
          {renderStatus()}
          <View
            style={{
              alignSelf: 'center',
              flex: 1,
              flexDirection: 'column',
              marginLeft: 10,
            }}>
            <Text numberOfLines={1} style={styles.member}>
              {stringUtils.formatNameOrAddress(
                user != null ? user.name : transaction.address,
              )}
            </Text>
            <Text style={[styles.balance, {textAlign: 'left', color: color}]}>
              {prefix}
              {transaction.value} {getSymbol(transaction.currency)}
            </Text>
          </View>
          {transaction.usdValue !== 0 ? (
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
  status: {
    width: 23,
    height: 23,
    borderRadius: 23,
    backgroundColor: 'white',
    position: 'absolute',
    left: 30,
    bottom: 0,
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
