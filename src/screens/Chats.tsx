import React, {useContext, useEffect} from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import {ChatShortInfo} from 'components/index';
import {ChatInfo} from 'models/chatInfo';
import TransactionsStore from 'storage/Transactions';
import ChatsStore from 'storage/Chats';
import Ionicons from 'react-native-vector-icons/Ionicons';

export const Chats = ({navigation}: {navigation: any}) => {
  const chatsContext = useContext(ChatsStore.Context);
  const transactionsContext = useContext(TransactionsStore.Context);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Ionicons name="add" size={32} color="#2AB2E2" />
          </TouchableOpacity>
        );
      },
    });
  }, []);
  const getChats = () => {
    return Array.from(chatsContext.state.chatsInfo.values())
      .filter(
        (
          value, //TODO: add users chats
        ) =>
          transactionsContext.state.transactions.has(value.lastTxCurrency) &&
          transactionsContext.state.transactions
            ?.get(value.lastTxCurrency)!
            .has(value.lastTxId),
      )
      .sort((a, b) => b.timestamp - a.timestamp);
  };
  const renderItem = ({item}: {item: ChatInfo}) => {
    const tx = transactionsContext.state.transactions
      .get(item.lastTxCurrency)!
      .get(item.lastTxId)!;
    return (
      <TouchableHighlight
        onPress={() => navigation.navigate('Chat', {chatInfo: item})}
        underlayColor="#f8f9fb">
        <ChatShortInfo
          name={item.name}
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
        keyExtractor={(item, index) => String(index)}
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
