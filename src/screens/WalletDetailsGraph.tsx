import React, {useContext } from 'react';
import { VictoryPie, VictoryLegend } from "victory-native";
import {
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Wallet} from 'types/wallet';
import {Transaction} from 'types/transaction';
import stringUtils from 'utils/string';
import GlobalStore from 'storage/Global';
import ChatsStore from 'storage/Chats';
import {TransactionInfo} from 'components/TransactionInfo';

/**
 * Screen with wallet details
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

  //data for graph
  const currencies = ['Polkadot', 'Kusama'];
  const currenciesColors = ['#E6007A', '#888888'];
  //arrays for graph
  const balance = new Array();
  const graphColor = new Array();
  const legends = new Array();
  const getDataWithSections = () => {
    let sections = [];
    const now = new Date();
    let txsBySelections = new Map<string, Array<Transaction>>();
    const txs = new Array<Transaction>();

    for (let w of wallets) {
      if (!chatsContext.state.transactions.has(w.currency)) {
        continue;
      }
      else {
        for (let tx of chatsContext.state.transactions
          .get(w.currency)
          ?.transactionById.values()!) {
          txs.push(tx);
        }
      }
      //fill arrays for graph
      balance.push(w.balance);
      graphColor.push(currenciesColors[w.currency]);
      legends.push( { name: currencies[w.currency], symbol: { fill: currenciesColors[w.currency], type: 'square' } });
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
      <SectionList
        ListHeaderComponent={() => (
          <View style={styles.statistics}>
            <View style={styles.legend}>
              <VictoryLegend             
                orientation="vertical"
                gutter={20}
                data={legends}
              />
            </View>
          
            <View style={{flex: 1}}>
                <VictoryPie height={230}
                    radius={90}
                    innerRadius={60}
                    data={balance}
                    style={{ labels: { display: "none"}}}
                    colorScale={graphColor}
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
  );
};

const styles = StyleSheet.create({
  statistics: {
    flex:2,
    width: '100%'
  },
  legend: {
    position: 'absolute',
    width:'30%',
    paddingTop: 30
  },
  transactionsInfo: {
    flex:1,
    alignSelf: 'center',
    width: '85%',
    borderTopColor: 'gray',
    borderTopWidth: 1,
    paddingTop: '8%'
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
    marginTop: 15,
    width: '90%',
    height: 1,
    backgroundColor: '#cccccc',
  },
});
