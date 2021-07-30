import React, {useEffect, useState} from 'react';
import {VictoryPie, VictoryLegend} from 'victory-native';
import {SectionList, StyleSheet, Text, View} from 'react-native';
import {Wallet, getColor, getName} from 'types/wallet';
import {Transaction} from 'types/transaction';
import stringUtils from 'utils/string';
import {TransactionInfo} from 'components/TransactionInfo';
import { Profile } from 'types/profile';
import { useSelector } from 'react-redux';
import ChatsStore from 'storage/Chats';
import UsersStore from 'storage/Users';

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
  const usersState: UsersStore.State = useSelector((state: any) => state.users);
  const chatsState: ChatsStore.State = useSelector((state: any) => state.chats);

  const wallets: Array<Wallet> = route.params.wallets;

  //arrays for graph
  const [balanceData, setBalance] = useState(new Array());
  const [colors, setColors] = useState(new Array());
  const [legendData, setLegends] = useState(new Array());

  useEffect(() => {
    let colorsArray = new Array();
    let balanceArray = new Array();
    let legendsArray = new Array();

    for (let w of wallets) {
      if (!w.usdValue) {
        continue;
      } else {
        colorsArray.push(getColor(w.currency));
        balanceArray.push(w.usdValue);
        legendsArray.push({
          name: getName(w.currency),
          symbol: {fill: getColor(w.currency), type: 'square'},
        });
      }
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
      if (!chatsState.transactions[w.currency]) {
        continue;
      }
      const stateTxs = chatsState.transactions[w.currency]?.transactionById!;
      for (let id in stateTxs) {
        txs.push(stateTxs[id]);
      }
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
            item.userId != null && usersState.users[item.userId]
              ? (usersState.users[item.userId]!.value as Profile)
              : null
          }
          onPress={() =>
            navigation.navigate('TransactionDetails', {
              transaction: item,
              wallet: wallets[item.currency],
              user:
                item.userId != null &&
                usersState.users[item.userId]
                  ? usersState.users[item.userId]
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
  dividingLine: {
    alignSelf: 'center',
    marginTop: 15,
    width: '90%',
    height: 1,
    backgroundColor: '#cccccc',
  },
});
