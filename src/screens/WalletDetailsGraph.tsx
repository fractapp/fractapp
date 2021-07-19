import React, {useContext, useEffect, useState} from 'react';
import {VictoryPie, VictoryLegend} from 'victory-native';
import {SectionList, StyleSheet, Text, View, Image} from 'react-native';
import {Wallet, getColor, getName} from 'types/wallet';
import {Transaction} from 'types/transaction';
import stringUtils from 'utils/string';
import GlobalStore from 'storage/Global';
import ChatsStore from 'storage/Chats';
import {TransactionInfo} from 'components/TransactionInfo';
import StringUtils from 'utils/string';

/**
 * Screen with wallet details graphic
 * @category Screens
 */

export const WalletDetailsGraph = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const globalContext = useContext(GlobalStore.Context);
  const chatsContext = useContext(ChatsStore.Context);
  const wallets: Array<Wallet> = route.params.wallets;

  //arrays for graph
  const [balanceData, setBalance] = useState(new Array());
  const [colors, setColors] = useState(new Array());
  const [legendData, setLegends] = useState(new Array());
  const [emptyUsdValue, setEmptyUsdValue] = useState(true);
  const [emptyTxs, setEmptyTxs] = useState(true);

  useEffect(() => {
    let colorsArray = new Array();
    let balanceArray = new Array();
    let legendsArray = new Array();
    for (let w of wallets) {
      if (!w.usdValue) {
        setEmptyUsdValue(true);
        continue;
      } else {
        setEmptyUsdValue(false);
        balanceArray.push(w.usdValue);
        colorsArray.push(getColor(w.currency));
        legendsArray.push({
          name: getName(w.currency),
          symbol: {fill: getColor(w.currency), type: 'square'},
        });
      }
    }
    if (emptyUsdValue) {
      balanceArray.push(1);
      colorsArray.push('#cccccc');
    }
    if (chatsContext.state.transactions.size === 0) {
      setEmptyTxs(true);
    } else {
      setEmptyTxs(false);
    }

    setColors(colorsArray);
    setBalance(balanceArray);
    setLegends(legendsArray);
  }, []);

  const getDataWithSections = () => {
    let sections = [];
    const now = new Date();
    let txsBySelections = new Map<string, Array<Transaction>>();
    const txs = new Array<Transaction>();
    
    for (let w of wallets) {
      if (!chatsContext.state.transactions.has(w.currency)) {
        continue;
      }
      for (let tx of chatsContext.state.transactions
        .get(w.currency)
        ?.transactionById.values()!) {
        txs.push(tx);
      }
    }

    for (let tx of txs.sort((a, b) => b.timestamp - a.timestamp)) {
      let dateValue = stringUtils.toTitle(now, new Date(tx.timestamp));
      if (!txsBySelections.has(dateValue)) {
        txsBySelections.set(dateValue, new Array<Transaction>());
      }
      txsBySelections.get(dateValue)?.push(tx);
    }
    return sections;
  };

  return (
    <View>
      <SectionList
        ListHeaderComponent={() => (
          <View style={styles.statistics}>
            <View style={styles.legend}>
              <VictoryLegend
                orientation="vertical"
                gutter={20}
                data={legendData}
              />
            </View>

            <View style={{flex: 1}}>
              <VictoryPie
                height={230}
                radius={90}
                innerRadius={60}
                data={balanceData}
                style={{labels: {display: 'none'}}}
                colorScale={colors}
              />
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
                wallet: wallets[item.currency],
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
  statistics: {
    width: '100%',
  },
  legend: {
    position: 'absolute',
    width: '30%',
    paddingTop: 30,
  },
  transactionsInfo: {
    flex: 1,
    alignSelf: 'center',
    width: '85%',
    borderTopColor: 'gray',
    borderTopWidth: 1,
    paddingTop: '8%',
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
  emptyBalance: {
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  dividingLine: {
    alignSelf: 'center',
    marginTop: 15,
    width: '90%',
    height: 1,
    backgroundColor: '#cccccc',
  },
  notFound: {
    marginTop: 90,
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
