import React, {useContext} from 'react';
import {FlatList, StyleSheet, TouchableHighlight, View} from 'react-native';
import {ChatShortInfo} from 'components';
import {ChatInfo} from 'models/chatInfo';
import TransactionsStore from 'storage/Transactions';
import ChatsStore from 'storage/Chats';

export const Chats = ({navigation}: {navigation: any}) => {
  const chatsContext = useContext(ChatsStore.Context);
  const transactionsContext = useContext(TransactionsStore.Context);

  const getChats = () => {
    return Array.from(chatsContext.state.chatsInfo.values())
      .filter(
        (value) =>
          transactionsContext.state.has(value.currency) &&
          transactionsContext.state.get(value.currency).has(value.lastTxId),
      )
      .sort(function (a, b) {
        return a.timestamp < b.timestamp;
      });
  };
  const renderItem = ({item}: {item: ChatInfo}) => {
    const tx = transactionsContext.state.get(item.currency).get(item.lastTxId);
    return (
      <TouchableHighlight
        onPress={() => navigation.navigate('Chat', {chatInfo: item})}
        underlayColor="#f8f9fb">
        <ChatShortInfo
          address={item.address}
          notificationCount={item.notificationCount}
          tx={tx}
        />
      </TouchableHighlight>
    );
  };

  return (
    <View style={styles.chats}>
      <FlatList
        ItemSeparatorComponent={() => <View style={styles.dividingLine} />}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        data={getChats()}
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
