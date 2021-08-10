import React, {useEffect} from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import {ChatShortInfo} from 'components/ChatShortInfo';
import {ChatInfo} from 'types/chatInfo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import ChatsStore from 'storage/Chats';
import UsersStore from 'storage/Users';

/**
 * Chat list screen
 * @category Screens
 */
export const Chats = ({navigation}: {navigation: any}) => {
  const chatsState: ChatsStore.State = useSelector((state: any) => state.chats);
  const usersState: UsersStore.State = useSelector((state: any) => state.users);

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
    const chats = Object.keys(chatsState.chatsInfo).map((key) => chatsState.chatsInfo[key])
      .sort((a, b) => {
        const msgOne = chatsState.chats[a.id]!.messages[a.lastMsgId]!;
        const msgTwo = chatsState.chats[b.id]!.messages[b.lastMsgId]!;

        return msgOne.timestamp - msgTwo.timestamp;
      });

    return chats;
  };

  const renderItem = ({item}: {item: ChatInfo}) => {
    const user = usersState.users[item.id]!;

    if (!usersState.users[item.id]) {
      return <View />; //TODO: get user from server
    }
    const msg = chatsState.chats[item.id]!.messages[item.lastMsgId]!;

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
