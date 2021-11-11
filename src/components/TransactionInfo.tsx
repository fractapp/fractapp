import React from 'react';
import { Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { Transaction, TxAction, TxStatus, TxType } from 'types/transaction';
import { getSymbol } from 'types/wallet';
import { WalletLogo } from 'components/WalletLogo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Profile } from 'types/profile';
import backend from 'utils/fractappClient';
import stringUtils from 'utils/string';
import { getTxName } from 'types/inputs';

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
  user: Profile | null;
  onPress: () => void;
}) => {
  let prefix: string;
  let color: string;
  switch (transaction.txType) {
    case TxType.None:
      prefix = '';
      color = '#888888';
      break;
    case TxType.In:
      prefix = '+';
      color = '#67D44D';
      break;
    case TxType.Out:
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
          {user != null && transaction.action !== TxAction.StakingWithdrawn && transaction.action !== TxAction.StakingReward ? (
            <Image
              source={{
                uri: backend.getImgUrl(user.id, user.lastUpdate),
              }}
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
              {transaction.action === TxAction.Transfer ?
                stringUtils.formatNameOrAddress(
                  user != null
                    ? (
                      user.name !== undefined && user.name !== ''
                        ? user.name
                        : user.username
                    )
                    : transaction.address,
                ) : getTxName(transaction.action)
              }
            </Text>
            <Text style={[styles.balance, {textAlign: 'left', color: color}]}>
              {prefix}
              {transaction.fullValue} {getSymbol(transaction.currency)}
            </Text>
          </View>
          {transaction.usdValue !== 0 ? (
            <Text style={[styles.balance, {alignSelf: 'center', color: color}]}>
              {prefix}${(String(transaction.usdValue).length < 3 ? transaction.usdValue.toFixed(2) : transaction.usdValue)}
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
