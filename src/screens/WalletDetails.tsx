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
import { useSelector } from 'react-redux';
import UsersStore from 'storage/Users';
import { Currency } from 'types/wallet';
import AccountsStore from 'storage/Accounts';
import { Account } from 'types/account';
import ServerInfoStore from 'storage/ServerInfo';

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
  const accountState: AccountsStore.State = useSelector((state: any) => state.accounts);
  const usersState: UsersStore.State = useSelector((state: any) => state.users);
  const chatsState: ChatsStore.State = useSelector((state: any) => state.chats);
  const serverInfoState: ServerInfoStore.State = useSelector((state: any) => state.serverInfo);

  const currency: Currency = route.params.currency;
  const account: Account = accountState.accounts[currency];

  const getDataWithSections = () => {
    let sections = [];

    const now = new Date();
    let txsBySelections = new Map<string, Array<Transaction>>();
    const txs: Array<Transaction> = [];

    if (!chatsState.transactions[account.currency]) {
      return [];
    }

    const stateTransactions = chatsState.transactions[account.currency]?.transactionById!;
    for (let id in stateTransactions) {
      txs.push(stateTransactions[id]);
    }

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

  return (
    <View style={{width: '100%'}}>
      <SectionList
        ListHeaderComponent={() => (
          <View>
            <WalletDetailsInfo account={account} price={serverInfoState.prices[currency]} />
            <View style={styles.btns}>
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
              <View style={[styles.btn, {marginLeft: 30}]}>
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
            </View>
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
            source={require('assets/img/not-found-bot.png')}
            style={{
              width: 150,
              height: 150,
              alignSelf: 'center',
              marginRight: 20,
            }}
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
