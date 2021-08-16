import React, {useEffect, useState} from 'react';
import {VictoryPie, VictoryLegend} from 'victory-native';
import { Image, SectionList, StyleSheet, Text, View } from 'react-native';
import {getColor, getName} from 'types/wallet';
import {Transaction} from 'types/transaction';
import stringUtils from 'utils/string';
import {TransactionInfo} from 'components/TransactionInfo';
import { Profile } from 'types/profile';
import { useSelector } from 'react-redux';
import ChatsStore from 'storage/Chats';
import UsersStore from 'storage/Users';
import { Account } from 'types/account';
import AccountsStore from 'storage/Accounts';
import ServerInfoStore from 'storage/ServerInfo';
import StringUtils from 'utils/string';

/**
 * Screen with wallet details
 * @category Screens
 */

export const WalletDetailsGraph = ({
  navigation,
}: {
  navigation: any;
}) => {
  const serverInfoState: ServerInfoStore.State = useSelector((state: any) => state.serverInfo);
  const accountState: AccountsStore.State = useSelector((state: any) => state.accounts);
  const usersState: UsersStore.State = useSelector((state: any) => state.users);
  const chatsState: ChatsStore.State = useSelector((state: any) => state.chats);

  const accounts: Array<Account> = Object.entries(accountState.accounts).map((value: [string, Account]) => value[1]);

  //arrays for graph
  const [balanceData, setBalance] = useState(new Array());
  const [colors, setColors] = useState(new Array());
  const [legendData, setLegends] = useState(new Array());

  useEffect(() => {
    let colorsArray = new Array();
    let balanceArray = new Array();
    let legendsArray = new Array();

    for (let account of accounts) {
      let usdValue = 0;
      if (serverInfoState.prices[account.currency]) {
        const price = serverInfoState.prices[account.currency]!;

        usdValue = account.balance * price;
      }

      if (!usdValue) {
        continue;
      } else {
        colorsArray.push(getColor(account.currency));
        balanceArray.push(usdValue);
        legendsArray.push({
          name: getName(account.currency),
          symbol: { fill: getColor(account.currency), type: 'square' },
        });
      }
    }
    if (balanceArray.length === 0) {
      setColors(['#CCCCCC']);
      setBalance([ 100 ]);
    } else {
      setColors(colorsArray);
      setBalance(balanceArray);
      setLegends(legendsArray);
    }
  }, []);

  const getDataWithSections = () => {
    let sections = [];
    const now = new Date();
    let txsBySelections = new Map<string, Array<Transaction>>();
    const txs = new Array<Transaction>();

    for (let w of accounts) {
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
  const data = getDataWithSections();
  return (
    <View style={{ width: '100%' }}>
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

            <View style={{ flex: 1 }}>
              <VictoryPie
                height={230}
                radius={90}
                innerRadius={60}
                data={balanceData}
                style={{ labels: { display: 'none' } }}
                colorScale={colors}
              />
            </View>

            <View style={styles.dividingLine} />
          </View>
        )}
        sections={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
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
                currency: item.currency,
                user:
                  item.userId != null &&
                  usersState.users[item.userId]
                    ? usersState.users[item.userId]
                    : null,
              })
            }
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={{ marginTop: 10 }}>
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
  statistics: {
    width: '100%',
  },
  legend: {
    position: 'absolute',
    paddingLeft: 10,
    paddingTop: 30,
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
