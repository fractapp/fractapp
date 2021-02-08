import React, {useContext} from 'react';
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import {Wallet} from 'models/wallet';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Transaction} from 'models/transaction';
import {TransactionInfo, WalletDetailsInfo} from 'components/index';
import stringUtils from 'utils/string';
import TransactionsStore from 'storage/Transactions';
import GlobalStore from 'storage/Global';

export const WalletDetails = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const globalContext = useContext(GlobalStore.Context);
  const transactionsContext = useContext(TransactionsStore.Context);
  const wallet: Wallet = route.params.wallet;

  const getDataWithSections = () => {
    let sections = [];

    const now = new Date();
    let txsBySelections = new Map<string, Array<Transaction>>();
    //TODO: refactoring
    const txs = new Array<Transaction>();
    for (let tx of transactionsContext.state.transactions
      .get(wallet.currency)
      ?.values()!) {
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
              <View>
                <TouchableHighlight
                  onPress={() =>
                    navigation.navigate('Search', {
                      isEditable: true,
                      wallet: wallet,
                    })
                  }
                  underlayColor="#f8f9fb"
                  style={styles.btn}>
                  <MaterialCommunityIcons
                    name="upload-outline"
                    size={24}
                    color="#666666"
                  />
                </TouchableHighlight>
                <Text style={styles.btnText}>Send</Text>
              </View>
              <View style={{marginLeft: 30}}>
                <TouchableHighlight
                  onPress={() =>
                    navigation.navigate('Receive', {
                      address: wallet.address,
                      currency: wallet.currency,
                    })
                  }
                  underlayColor="#f8f9fb"
                  style={[styles.btn]}>
                  <MaterialCommunityIcons
                    name="download-outline"
                    size={24}
                    color="#666666"
                  />
                </TouchableHighlight>
                <Text style={styles.btnText}>Receive</Text>
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
});
