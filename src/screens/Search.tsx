import React, {useEffect, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableHighlight,
  View,
} from 'react-native';
import {Contact} from 'components/index';

import Ionicons from 'react-native-vector-icons/Ionicons';
import backend from 'utils/backend';
import {ChatInfo, ChatType} from 'models/chatInfo';
import {Currency} from 'models/wallet';

export const Search = ({navigation}: {navigation: any}) => {
  const [searchString, setSearchString] = useState<string>('');
  const [users, setUsers] = useState<Array<any>>();

  //TODO: add users without me
  useEffect(() => {
    setUsers([]);
    if (searchString[0] === '@') {
      backend.search(searchString.split('@')[1]).then((users) => {
        setUsers(users);
      });
    }
  }, [searchString]);

  const renderItem = ({item}: {item: any}) => {
    return (
      <TouchableHighlight
        onPress={() =>
          navigation.navigate('Chat', {
            chatInfo: new ChatInfo(
              item.username,
              item.name,
              '',
              0,
              0,
              0,
              ChatType.Chat,
              {
                username: item.username,
                addresses: new Map<Currency, string>([
                  [Currency.Polkadot, item.addresses[Currency.Polkadot]],
                  [Currency.Kusama, item.addresses[Currency.Kusama]],
                ]),
                avatarExt: item.avatarExt,
                id: item.id,
                lastUpdate: item.lastUpdate,
              },
            ),
          })
        }
        underlayColor="#f8f9fb">
        <Contact
          name={item.name}
          img={
            item.avatarExt === ''
              ? require('assets/img/default-avatar.png')
              : {
                  uri: backend.getImgUrl(
                    item.id,
                    item.avatarExt,
                    item.lastUpdate,
                  ),
                }
          }
          usernameOrPhoneNumber={'@' + item.username}
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
          placeholder={'Search by @username or email'}
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
        data={users}
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
