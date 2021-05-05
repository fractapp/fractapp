import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {Transaction, TxStatus, TxType} from 'types/transaction';
import {getSymbol, Wallet} from 'types/wallet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {WalletInfo} from 'components/WalletInfo';
import {WalletLogo} from 'components/WalletLogo';
import StringUtils from 'utils/string';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Clipboard from '@react-native-community/clipboard';
import {showMessage} from 'react-native-flash-message';
import {UserProfile} from 'types/profile';
import backend from 'utils/backend';

/**
 * Screen with transaction details
 * @category Screens
 */
export const TransactionDetails = ({route}: {route: any}) => {
  const tx: Transaction = route.params.transaction;
  const wallet: Wallet = route.params.wallet;
  const user: UserProfile = route.params?.user;

  const renderStatus = () => {
    switch (tx.status) {
      case TxStatus.Success:
        return (
          <View style={styles.status}>
            <MaterialIcons name="done" size={25} color="#67D44D" />
            <Text style={styles.statusText}>
              {StringUtils.texts.statuses.success}
            </Text>
          </View>
        );
      case TxStatus.Pending:
        return (
          <View style={styles.status}>
            <MaterialIcons name="schedule" size={25} color="#F39B34" />
            <Text style={styles.statusText}>
              {StringUtils.texts.statuses.pending}
            </Text>
          </View>
        );
      case TxStatus.Fail:
        return (
          <View style={styles.status}>
            <MaterialCommunityIcons name="close" size={25} color="#EA4335" />
            <Text style={styles.statusText}>
              {StringUtils.texts.statuses.failed}
            </Text>
          </View>
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
    <View style={{flexDirection: 'column', flex: 1, alignItems: 'center'}}>
      <View style={styles.info}>
        {user != null ? (
          <Image
            source={{
              uri: backend.getImgUrl(user.id, user.lastUpdate),
            }}
            width={80}
            height={80}
            style={{width: 80, height: 80, borderRadius: 45}}
          />
        ) : (
          <WalletLogo currency={tx.currency} size={80} />
        )}
        <Text
          onPress={() => {
            Clipboard.setString(user != null ? user.username : tx.address);
            showMessage({
              message: StringUtils.texts.showMsg.copied,
              type: 'info',
              icon: 'info',
            });
          }}
          style={styles.address}>
          {user != null
            ? user.name !== undefined && user.name !== ''
              ? user.name
              : user.username
            : tx.address}
        </Text>
        <Text style={[styles.value, {color: amountColor()}]}>
          {tx.usdValue !== 0
            ? '$' + tx.usdValue
            : `${tx.value} ${getSymbol(tx.currency)}`}
        </Text>
        {tx.usdValue !== 0 ? (
          <Text style={styles.subValue}>
            ({tx.value} {getSymbol(tx.currency)})
          </Text>
        ) : (
          <></>
        )}
        {renderStatus()}
      </View>

      <View style={{width: '100%', marginTop: 30}}>
        <Text style={[styles.title, {marginBottom: 10}]}>
          {tx.txType === TxType.Sent
            ? StringUtils.texts.WriteOffAccountTitle
            : StringUtils.texts.ReceivingAccountTitle}
        </Text>
        <WalletInfo wallet={wallet} />
      </View>

      <View style={{width: '100%', flexDirection: 'row', marginTop: 20}}>
        <View style={{flex: 1}}>
          <Text style={[styles.title, {marginBottom: 5}]}>Date</Text>
          <Text style={styles.dateAndFee}>
            {StringUtils.fromFullDate(new Date(tx.timestamp)) +
              ' ' +
              StringUtils.fromTime(new Date(tx.timestamp))}
          </Text>
        </View>
        <View style={{flex: 1, alignItems: 'flex-end'}}>
          {tx.txType === TxType.Sent && (
            <View>
              <Text style={[styles.title, {marginBottom: 5}]}>Fee</Text>
              {tx.usdFee === 0 ? (
                <Text style={styles.dateAndFee}>
                  {tx.fee} {getSymbol(wallet.currency)}
                </Text>
              ) : (
                <Text style={styles.dateAndFee}>${tx.usdFee}</Text>
              )}
            </View>
          )}
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
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
    color: '#888888',
  },
  dateAndFee: {
    marginLeft: 20,
    marginRight: 20,
    alignSelf: 'flex-start',
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
    color: 'black',
  },
});
