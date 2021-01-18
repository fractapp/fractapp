import React, {useContext, useEffect, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  View,
  Text,
  TextInput,
} from 'react-native';
import {ChatShortInfo} from 'components';
import {ChatInfo} from 'models/chatInfo';
import TransactionsStore from 'storage/Transactions';
import ChatsStore from 'storage/Chats';
import Ionicons from 'react-native-vector-icons/Ionicons';

export const Search = ({navigation}: {navigation: any}) => {
  const chatsContext = useContext(ChatsStore.Context);
  const transactionsContext = useContext(TransactionsStore.Context);

  const [searchString, setSearchString] = useState<string>();

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
    <View style={styles.users}>
      <View style={styles.searchBox}>
        <Ionicons
          name={'arrow-back'}
          style={{paddingLeft: 10}}
          size={25}
          color={'#BFBDBD'}
          onPress={() => navigation.goBack()}
        />
        <TextInput
          style={[
            styles.search,
            {
              width: '100%',
            },
          ]}
          value={searchString}
          onChangeText={(text) => {
            setSearchString(text);
          }}
          placeholder={'Search'}
          keyboardType={'default'}
          placeholderTextColor={'#949499'}
          autoCompleteType={'username'}
          textContentType={'username'}
          secureTextEntry={false}
        />
      </View>
      <FlatList
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
  users: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  searchBox: {
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row',
    width: '92%',
    backgroundColor: '#E9E9E9',
    borderRadius: 11,
  },
  search: {
    marginLeft: 10,
    padding: 0,
    fontSize: 17,
    height: 40,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'black',
  },
  list: {
    marginTop: 20,
    flex: 1,
    width: '100%',
  },
});
