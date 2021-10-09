import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Transaction, TxAction, TxStatus, TxType } from 'types/transaction';
import { getSymbol } from 'types/wallet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { WalletInfo } from 'components/WalletInfo';
import { WalletLogo } from 'components/WalletLogo';
import StringUtils from 'utils/string';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Clipboard from '@react-native-community/clipboard';
import { showMessage } from 'react-native-flash-message';
import { Profile, User } from 'types/profile';
import backend from 'utils/api';
import AccountsStore from 'storage/Accounts';
import { useSelector } from 'react-redux';
import ServerInfoStore from 'storage/ServerInfo';
import { Account, AccountType } from 'types/account';
import UsersStore from 'storage/Users';
import { getTxName } from 'types/inputs';

/**
 * Screen with transaction details
 * @category Screens
 */
export const TransactionDetails = ({route, navigation}: {route: any, navigation: any}) => {
  const accountState: AccountsStore.State = useSelector((state: any) => state.accounts);
  const usersState: UsersStore.State = useSelector((state: any) => state.users);
  const serverInfoState: ServerInfoStore.State = useSelector((state: any) => state.serverInfo);

  const tx: Transaction = route.params.transaction;

  const user: User = usersState.users[tx.userId == null ? tx.address : tx.userId];
  const account: Account = accountState.accounts[AccountType.Main][tx.currency];

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

  const mainValue = tx.usdValue !== 0
    ? String(String(tx.usdValue).length < 3 ? tx.usdValue.toFixed(2) : tx.usdValue)
    : tx.fullValue;

  const name = tx.action === TxAction.Transfer ? (
    user.isAddressOnly
      ? tx.address
      : (
        (user.value as Profile).name !== undefined && (user.value as Profile).name !== ''
          ? (user.value as Profile).name
          : (user.value as Profile).username
      )
  ) : getTxName(tx.action);

  const accountTitle = () => {
    switch (tx.txType) {
      case TxType.None:
        return StringUtils.texts.AccountTitle;
      case TxType.Sent:
        return StringUtils.texts.WriteOffAccountTitle;
      case TxType.Received:
        return StringUtils.texts.ReceivingAccountTitle;
    }
  };
  return (
    <View style={{flexDirection: 'column', flex: 1, alignItems: 'center'}}>
      <View style={styles.info}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('ProfileInfo', {
              userId: tx.userId == null ? tx.address : tx.userId,
            })
          }
        >
        {user.isAddressOnly ? (
            <WalletLogo currency={tx.currency} size={80} />
        ) : (
          <Image
            source={{
              uri: backend.getImgUrl((user.value as Profile).id, (user.value as Profile).lastUpdate),
            }}
            width={80}
            height={80}
            style={{width: 80, height: 80, borderRadius: 45}}
          />
        )}
        </TouchableOpacity>
        <Text
          onPress={() => {
            Clipboard.setString(user.isAddressOnly != null ? tx.address : (user.value as Profile).username);
            showMessage({
              message: StringUtils.texts.showMsg.copiedToClipboard,
              type: 'info',
              icon: 'info',
            });
          }}
          style={styles.address}>
          {name}
        </Text>
        <Text style={[styles.value, {color: amountColor(), fontSize: 40 - (mainValue.length - 1)}]}>
          {tx.usdValue !== 0
            ? '$' + mainValue
            : `${mainValue} ${getSymbol(tx.currency)}`}
        </Text>
        {tx.usdValue !== 0 ? (
          <Text style={[styles.subValue, { fontSize: 20 }]}>
            ({tx.fullValue} {getSymbol(tx.currency)})
          </Text>
        ) : (
          <></>
        )}
        {renderStatus()}
      </View>

      <View style={{width: '100%', marginTop: 30}}>
        <Text style={[styles.title, {marginBottom: 10}]}>
          {accountTitle()}
        </Text>
          <WalletInfo account={account} price={serverInfoState.prices[account.currency]} />
      </View>

      <View style={{width: '100%', flexDirection: 'row', marginTop: 20}}>
        <View style={{flex: 1}}>
          <Text style={[styles.title, {marginBottom: 5}]}>
            {StringUtils.texts.DateTitle}
          </Text>
          <Text style={styles.dateAndFee}>
            {StringUtils.fromFullDate(new Date(tx.timestamp)) +
              ' ' +
              StringUtils.fromTime(new Date(tx.timestamp))}
          </Text>
        </View>
        <View style={{flex: 1, alignItems: 'flex-end'}}>
          {(tx.txType === TxType.Sent || tx.txType === TxType.None) && (
            <View>
              <Text style={[styles.title, {marginBottom: 5}]}>
                {StringUtils.texts.FeeTitle}
              </Text>
              {tx.usdFee === 0 ? (
                <Text style={styles.dateAndFee}>
                  {tx.fee} {getSymbol(account.currency)}
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
    fontFamily: 'Roboto-Regular',
    color: 'black',
  },
  subValue: {
    textAlign: 'center',
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
    marginLeft: 3,
    fontSize: 17,
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
