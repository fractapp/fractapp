import React, {useContext, useEffect} from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import {ChatShortInfo} from 'components/ChatShortInfo';
import {ChatInfo} from 'types/chatInfo';
import ChatsStore from 'storage/Chats';
import GlobalStore from 'storage/Global';
import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 * Chat list screen
 * @category Screens
 */
export const Chats = ({navigation}: {navigation: any}) => {
  const chatsContext = useContext(ChatsStore.Context);
  const globalContext = useContext(GlobalStore.Context);

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
    const chats = Array.from(chatsContext.state.chatsInfo.values())
      /*.filter(
        (value) =>
          chatsContext.state.transactions.has(value.lastTxCurrency) &&
          chatsContext.state.transactions
            ?.get(value.lastTxCurrency)!
            .transactionById.has(value.lastTxId), TODO
      )*/
      .sort((a, b) => {
        const msgOne = chatsContext.state.chats.get(a.id)!.messages.get(a.lastMsgId)!;
        const msgTwo = chatsContext.state.chats.get(b.id)!.messages.get(b.lastMsgId)!;

        return  msgOne.timestamp - msgTwo.timestamp;
      });

      console.log(chatsContext.state.chatsInfo);
    return chats;
  };
  const renderItem = ({item}: {item: ChatInfo}) => {
   /* const tx = chatsContext.state.transactions
      .get(item.lastTxCurrency)!
      .transactionById.get(item.lastTxId)!; TODO */
    const user = globalContext.state.users.get(item.id)!;
    const msg = chatsContext.state.chats.get(item.id)!.messages.get(item.lastMsgId)!;

    return (
      <TouchableHighlight
        onPress={() => navigation.navigate('Chat', {chatInfo: item})}
        underlayColor="#f8f9fb">
        <ChatShortInfo
          notificationCount={item.notificationCount}
          message={msg.value}
          timestamp={msg.timestamp}
          user={user ?? {
            isAddressOnly: false,
            value: {
              id: '0',
              name: 'Deleted',
              username: '-',
              avatarExt: '',
              lastUpdate: 0,
              addresses: new Map(),
            },
          }}
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
    backgroundColor: '#f5f5f5',
  },
});
