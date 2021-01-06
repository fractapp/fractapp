import React, {useContext, useEffect, useState} from 'react';
import {FlatList, StyleSheet, TouchableHighlight, View} from 'react-native';
import {ChatShortInfo} from 'components';
import DB from 'utils/db';
import {ChatInfo} from 'models/chatInfo';
import TransactionsStore from 'storage/Transactions';

export const Chats = ({navigation}: {navigation: any}) => {
  const [chats, setChats] = useState(new Array<ChatInfo>());
  const transactionsContext = useContext(TransactionsStore.Context);

  useEffect(() => {
    DB.getChats().then((chats) => {
      if (
        chats == null ||
        transactionsContext == null ||
        transactionsContext.transactions == null ||
        transactionsContext.transactions == undefined
      ) {
        return;
      }

      const chatsArray = Array.from(chats, ([key, value]) => value);

      chatsArray.sort(function (a, b): boolean {
        return (
          transactionsContext.transactions.get(a.currency).get(a.lastTxId)
            .timestamp <
          transactionsContext.transactions.get(b.currency).get(b.lastTxId)
            .timestamp
        );
      });

      setChats(chatsArray);
    });
  }, []);

  const renderItem = ({item}: {item: ChatInfo}) => {
    const tx = transactionsContext.transactions
      .get(item.currency)
      .get(item.lastTxId);
    return (
      <TouchableHighlight
        onPress={() => navigation.navigate('Chat')}
        underlayColor="#f8f9fb">
        <ChatShortInfo address={item.address} notificationCount={0} tx={tx} />
      </TouchableHighlight>
    );
  };

  return (
    <View style={styles.chats}>
      <FlatList
        ItemSeparatorComponent={() => <View style={styles.dividingLine} />}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        data={chats}
        renderItem={renderItem}
        keyExtractor={(item) => item.address}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chats: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  list: {
    flex: 1,
    width: '100%',
  },
  dividingLine: {
    marginLeft: 80,
    width: '100%',
    height: 1,
    backgroundColor: '#ededed',
  },
});
