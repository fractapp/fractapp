import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableHighlight,
  Alert,
  SectionList,
} from 'react-native';
import {Wallet} from 'models/wallet';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Transaction} from 'models/transaction';
import {WalletDetailsInfo, TransactionInfo} from 'components';
import {Api} from 'utils/polkadot';
import dateUtils from 'utils/date';

export const WalletDetails = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const [transactions, setTransactions] = useState<Map<string, Transaction>>(
    new Map(),
  );
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isEnd, setIsEnd] = useState<boolean>(false);
  const [lastPage, setLastPage] = useState<number>(0);
  const wallet: Wallet = route.params.wallet;

  const startUpdateTxs = () => {
    if (isLoading || isEnd) {
      return;
    }

    setLoading(true);
  };

  const updateTxs = async (page: number = 1, size: number = 10) => {
    const api = Api.getInstance(wallet.currency);
    let txs = await api.getTransactions(wallet.address, page, size);
    const updatedMap = new Map(transactions);
    for (let i = 0; i < txs.length; i++) {
      updatedMap.set(txs[i].id, txs[i]);
    }

    if (txs.length < size) {
      setIsEnd(true);
    }

    setLastPage(page);
    setTransactions(updatedMap);
    setLoading(false);
  };

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    updateTxs(lastPage + 1);
  }, [isLoading]);

  const getDataWithSections = () => {
    let sections = new Array();

    const now = new Date();
    let txsBySelections = new Map<string, Array<Transaction>>();
    for (let [id, tx] of transactions) {
      let dateValue = dateUtils.toTitle(now, tx.date);
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
                  onPress={() => Alert.alert('Milestone 3.1 (Chat)')}
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
        ListFooterComponent={
          isLoading ? (
            <View style={{marginTop: 10, marginBottom: 10}}>
              <ActivityIndicator size={30} color="#2AB2E2" />
            </View>
          ) : null
        }
        onEndReachedThreshold={0.01}
        sections={getDataWithSections()}
        keyExtractor={(item, index) => item + index}
        renderItem={({item}) => (
          <TransactionInfo
            key={item.id}
            transaction={item}
            onPress={() =>
              navigation.navigate('TransactionDetails', {
                transaction: item,
                wallet: wallet,
              })
            }
          />
        )}
        onEndReached={startUpdateTxs}
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
