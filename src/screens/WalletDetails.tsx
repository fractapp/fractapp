import React, {useContext, useEffect, useState} from 'react';
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Image,
} from 'react-native';
import {Wallet} from 'types/wallet';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Transaction} from 'types/transaction';
import {TransactionInfo} from 'components/TransactionInfo';
import {WalletDetailsInfo} from 'components/WalletDetailsInfo';
import stringUtils from 'utils/string';
import GlobalStore from 'storage/Global';
import ChatsStore from 'storage/Chats';
import StringUtils from 'utils/string';

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
  const globalContext = useContext(GlobalStore.Context);
  const chatsContext = useContext(ChatsStore.Context);
  const wallet: Wallet = route.params.wallet;
  const [emptyTxs, setEmptyTxs] = useState(true);

  useEffect(() => {
    if (chatsContext.state.transactions.size === 0) {
      setEmptyTxs(true);
    } else {
      setEmptyTxs(false);
    }
  }, []);

  const getDataWithSections = () => {
    let sections = [];

    const now = new Date();
    let txsBySelections = new Map<string, Array<Transaction>>();
    const txs = new Array<Transaction>();

    if (!chatsContext.state.transactions.has(wallet.currency)) {
      return [];
    }

    for (let tx of chatsContext.state.transactions
      .get(wallet.currency)
      ?.transactionById.values()!) {
      txs.push(tx);
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

  return (
    <View style={{width: '100%'}}>
      <SectionList
        ListHeaderComponent={() => (
          <View>
            <WalletDetailsInfo wallet={wallet} />
            <View style={styles.btns}>
              <View style={styles.btn}>
                <TouchableHighlight
                  testID={'sendBtn'}
                  onPress={() =>
                    navigation.navigate('Search', {
                      wallet: wallet,
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
                      address: wallet.address,
                      currency: wallet.currency,
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
        sections={getDataWithSections()}
        keyExtractor={(item) => String(item.id)}
        renderItem={({item}) => (
          <TransactionInfo
            key={item.id}
            transaction={item}
            user={
              item.userId != null && globalContext.state.users.has(item.userId)
                ? globalContext.state.users.get(item.userId)!
                : null
            }
            onPress={() =>
              navigation.navigate('TransactionDetails', {
                transaction: item,
                wallet: wallet,
                user:
                  item.userId != null &&
                  globalContext.state.users.has(item.userId)
                    ? globalContext.state.users.get(item.userId)
                    : null,
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
      {emptyTxs === true ? 
        <View style={styles.notFound}>
          <Image
            source={require('assets/img/not-found-bot.png')}
            style={{
              width: 150,
              height: 150,
              alignSelf: 'center',
              marginRight: 20
            }}
          /> 
          <Text style={styles.notFoundText}>
            {StringUtils.texts.NoTransactionsTitle}
          </Text>
        </View> :
        true
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
