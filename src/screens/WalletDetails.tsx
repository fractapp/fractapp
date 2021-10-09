import React from 'react';
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Transaction} from 'types/transaction';
import {TransactionInfo} from 'components/TransactionInfo';
import {WalletDetailsInfo} from 'components/WalletDetailsInfo';
import stringUtils from 'utils/string';
import ChatsStore from 'storage/Chats';
import StringUtils from 'utils/string';
import { Profile } from 'types/profile';
import { useDispatch, useSelector } from 'react-redux';
import UsersStore from 'storage/Users';
import { Currency, filterTxsByAccountType, fromCurrency } from 'types/wallet';
import AccountsStore from 'storage/Accounts';
import { Account, AccountType } from 'types/account';
import ServerInfoStore from 'storage/ServerInfo';
import { randomAsHex } from '@polkadot/util-crypto';
import backend from 'utils/api';
// @ts-ignore
import {MAIN_BOT_ID} from '@env';
import { Message} from 'types/message';

/**
 * Screen with wallet details
 * @category Screens
 */
export const WalletDetails = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const dispatch = useDispatch();
  const globalState = useSelector((state: any) => state.global);

  const accountState: AccountsStore.State = useSelector((state: any) => state.accounts);
  const usersState: UsersStore.State = useSelector((state: any) => state.users);
  const chatsState: ChatsStore.State = useSelector((state: any) => state.chats);
  const serverInfoState: ServerInfoStore.State = useSelector((state: any) => state.serverInfo);

  const currency: Currency = route.params.currency;
  const type: AccountType = route.params.type;
  const account: Account = accountState.accounts[type][currency];

  const getDataWithSections = () => {
    let sections = [];

    const now = new Date();
    let txsBySelections = new Map<string, Array<Transaction>>();
    let txs: Array<Transaction> = [];

    if (!chatsState.transactions[account.currency]) {
      return [];
    }

    const stateTransactions = chatsState.transactions[account.currency]?.transactionById!;
    for (let id in stateTransactions) {
      txs.push(stateTransactions[id]);
    }

    txs = filterTxsByAccountType(txs, account.type);
    for (let tx of txs.sort((a, b) => b.timestamp - a.timestamp)) {
      let dateValue = stringUtils.toTitle(now, new Date(tx.timestamp));
      if (!txsBySelections.has(dateValue)) {
        txsBySelections.set(dateValue, new Array<Transaction>());
      }

      txsBySelections.get(dateValue)?.push(tx);
    }

    for (const [key, value] of txsBySelections) {
      sections.push({
        title: key,
        data: value,
      });
    }

    return sections;
  };
  const data = getDataWithSections();

  const generateBtns = () => {
    switch (account.type) {
      case AccountType.Main:
        return (<View style={styles.btns}>
          <View style={styles.btn}>
            <TouchableHighlight
              testID={'sendBtn'}
              onPress={() =>
                navigation.navigate('Search', {
                  currency: account.currency,
                })
              }
              underlayColor="#f8f9fb"
              style={styles.btnImg}>
              <MaterialCommunityIcons
                name="upload-outline"
                size={24}
                color="#666666"
              />
            </TouchableHighlight>
            <Text style={styles.btnText}>{StringUtils.texts.SendBtn}</Text>
          </View>
          <View style={[styles.btn, { marginLeft: 30 }]}>
            <TouchableHighlight
              testID={'receiveBtn'}
              onPress={() =>
                navigation.navigate('Receive', {
                  address: account.address,
                  currency: account.currency,
                })
              }
              underlayColor="#f8f9fb"
              style={[styles.btnImg]}>
              <MaterialCommunityIcons
                name="download-outline"
                size={24}
                color="#666666"
              />
            </TouchableHighlight>
            <Text style={styles.btnText}>
              {StringUtils.texts.ReceiveBtn}
            </Text>
          </View>
        </View>);
      case AccountType.Staking:
        return (<View style={styles.btns}>
          <View style={styles.btn}>
            <TouchableHighlight
              testID={'withdrawBtn'}
              onPress={() => {
                const msg: Message = {
                  id: 'answer-' + randomAsHex(32),
                  value: 'Withdraw',
                  action: '/withdraw',
                  args: {
                    currency: fromCurrency(account.currency),
                  },
                  rows: [],
                  timestamp: Date.now(),
                  sender: globalState.profile!.id,
                  receiver: MAIN_BOT_ID,
                  hideBtn: true,
                };
                backend.sendMsg({
                  version: 1,
                  value: msg.value,
                  action: msg.action!,
                  receiver: MAIN_BOT_ID,
                  args: msg.args,
                }).then((timestamp) => {
                  if (timestamp != null) {
                    msg.timestamp = timestamp;
                    dispatch(ChatsStore.actions.addMessages([{
                      chatId: MAIN_BOT_ID,
                      msg: msg,
                    }]));
                    navigation.navigate('Chat', {
                      chatId: MAIN_BOT_ID,
                    });
                  }
                });
              }}
              underlayColor="#f8f9fb"
              style={styles.btnImg}>
              <MaterialCommunityIcons
                name="upload-outline"
                size={24}
                color="#666666"
              />
            </TouchableHighlight>
            <Text style={styles.btnText}>{StringUtils.texts.WithdrawBtn}</Text>
          </View>
          <View style={[styles.btn, { marginLeft: 30 }]}>
            <TouchableHighlight
              testID={'investBtn'}
              onPress={() => {
                const msg: Message = {
                  id: 'answer-' + randomAsHex(32),
                  value: 'Invest',
                  action: '/invest',
                  args: {
                    currency: fromCurrency(account.currency),
                  },
                  rows: [],
                  timestamp: Date.now(),
                  sender: globalState.profile!.id,
                  receiver: MAIN_BOT_ID,
                  hideBtn: true,
                };
                backend.sendMsg({
                  version: 1,
                  value: msg.value,
                  action: msg.action!,
                  receiver: MAIN_BOT_ID,
                  args: msg.args,
                }).then((timestamp) => {
                  if (timestamp != null) {
                    msg.timestamp = timestamp;
                    dispatch(ChatsStore.actions.addMessages([{
                      chatId: MAIN_BOT_ID,
                      msg: msg,
                    }]));
                    navigation.navigate('Chat', {
                      chatId: MAIN_BOT_ID,
                    });
                  }
                });
              }}
              underlayColor="#f8f9fb"
              style={[styles.btnImg]}>
              <MaterialCommunityIcons
                name="download-outline"
                size={24}
                color="#666666"
              />
            </TouchableHighlight>
            <Text style={styles.btnText}>
              {StringUtils.texts.InvestBtn}
            </Text>
          </View>
        </View>);
    }
  };

  return (
    <View style={{width: '100%'}}>
      <SectionList
        ListHeaderComponent={() => (
          <View>
            <WalletDetailsInfo account={account} price={serverInfoState.prices[currency]} />
            {generateBtns()}
            <View style={styles.dividingLine} />
          </View>
        )}
        sections={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={({item}) => (
          <TransactionInfo
            key={item.id}
            transaction={item}
            user={
              item.userId != null && usersState.users[item.userId]
                ? (usersState.users[item.userId]!.value as Profile)
                : null
            }
            onPress={() =>
              navigation.navigate('TransactionDetails', {
                transaction: item,
                currency: account.currency,
              })
            }
          />
        )}
        renderSectionHeader={({section: {title}}) => (
          <View style={{marginTop: 10}}>
            <Text style={styles.dateTitle}>{title}</Text>
          </View>
        )}
      />
      {data.length === 0 ?
        <View style={styles.notFound}>
          <Image
            source={require('assets/img/not-transactions.png')}
            style={{
              width: 200,
              height: 200,
              alignSelf: 'center',
              marginRight: 25,
            }}
            resizeMode="center"
          />
          <Text style={styles.notFoundText}>
            {StringUtils.texts.NoTransactionsTitle}
          </Text>
        </View> :
        <View />
      }
    </View>
  );
};

const styles = StyleSheet.create({
  btns: {
    marginTop: 30,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnImg: {
    width: 70,
    height: 70,
    backgroundColor: '#F0EEEE',
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    paddingTop: 2,
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    textAlign: 'center',
    color: 'black',
  },
  dateTitle: {
    fontSize: 17,
    marginBottom: 5,
    fontFamily: 'Roboto-Bold',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'black',
    marginLeft: '5%',
  },
  dividingLine: {
    alignSelf: 'center',
    marginTop: 25,
    width: '90%',
    height: 1,
    backgroundColor: '#cccccc',
  },
  notFound: {
    marginTop: 120,
  },
  notFoundText: {
    alignSelf: 'center',
    marginTop: 10,
    fontSize: 19,
    color: '#888888',
    fontStyle: 'normal',
    fontWeight: 'normal',
  },
});
