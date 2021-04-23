import React, {useContext, useEffect, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableHighlight,
  View,
  PermissionsAndroid,
  Image,
  ActivityIndicator,
  Text,
} from 'react-native';
import Contacts from 'react-native-contacts';
import {isValidPhoneNumber, parsePhoneNumber} from 'react-phone-number-input';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Contact} from 'components/Contact';
import {SendBy} from 'components/SendBy';
import backend from 'utils/backend';
import GlobalStore from 'storage/Global';
import Dialog from 'storage/Dialog';
import DialogStore from 'storage/Dialog';
import {UserProfile} from 'types/profile';
import {Wallet} from 'types/wallet';
import {ChatInfo, ChatType} from 'types/chatInfo';
import ChatsStore from 'storage/Chats';

/**
 * Users search screen
 * @category Screens
 */
export const Search = ({navigation, route}: {navigation: any; route: any}) => {
  const wallet: Wallet = route.params?.wallet;

  const globalContext = useContext(GlobalStore.Context);
  const chatsContext = useContext(ChatsStore.Context);
  const dialogContext = useContext(DialogStore.Context);

  const [searchString, setSearchString] = useState<string>('');
  const [users, setUsers] = useState<Array<UserProfile>>();
  const [isLoading, setLoading] = useState<boolean>();
  const [lastSearch, setLastSearch] = useState<string>();

  useEffect(() => {
    if (!globalContext.state.isRegistered) {
      return;
    }
    getMyMatchContacts();

    (async () => {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      );
      if (status === 'never_ask_again') {
        dialogContext.dispatch(
          Dialog.open(
            'Open settings',
            'If you want to find users by your contacts then open the application settings and give it access to read your contacts .',
            () => dialogContext.dispatch(Dialog.close()),
          ),
        );
        return;
      }
      if (status !== 'granted') {
        return;
      }

      const contacts = await Contacts.getAll();

      const backendContacts = await backend.myContacts();

      const mapBackendContacts = new Map<string, boolean>();
      for (let v of backendContacts) {
        mapBackendContacts.set(v, true);
      }
      const validContacts = new Map<string, boolean>();
      for (let contact of contacts) {
        if (contact.phoneNumbers.length === 0) {
          continue;
        }

        for (let c of contact.phoneNumbers) {
          if (!isValidPhoneNumber(c.number)) {
            continue;
          }
          const number = parsePhoneNumber(c.number)?.number;
          if (number === undefined) {
            continue;
          }
          if (mapBackendContacts.has(number)) {
            continue;
          }
          validContacts.set(number, true);
        }
      }

      let result = Array.from(validContacts, ([number]) => number);
      if (result.length > 0) {
        await backend.updateContacts(result);
        await getMyMatchContacts();
      }
    })();
  }, []);

  const getMyMatchContacts = async () => {
    let contacts = await backend.myMatchContacts();

    contacts = contacts.filter(
      (user) => user.id !== globalContext.state.profile.id,
    );
    setUsers(contacts);
    const ids = new Array<string>();
    for (let user of contacts) {
      globalContext.dispatch(GlobalStore.setUser(user));
      ids.push(user.id);
    }

    globalContext.dispatch(GlobalStore.setContacts(ids));
  };

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isLoading && lastSearch === searchString) {
      return;
    }

    setLoading(true);
    setLastSearch(searchString);

    if (searchString.length === 0) {
      const contacts = new Array<UserProfile>();
      for (let id of globalContext.state.contacts) {
        if (!globalContext.state.users.has(id)) {
          continue;
        }
        contacts.push(globalContext.state.users.get(id)!);
      }
      setUsers(contacts);
      setLoading(false);
    } else {
      backend
        .search(searchString)
        .then((users: UserProfile[]) => {
          setUsers(
            users.filter((user) => user.id !== globalContext.state.profile.id),
          );
          setTimeout(() => setLoading(false), 1000);
        })
        .catch((e) => setTimeout(() => setLoading(false), 1000));
    }
  }, [searchString, isLoading]);

  const renderItem = ({item}: {item: UserProfile}) => {
    return (
      <TouchableHighlight
        onPress={() => {
          globalContext.dispatch(GlobalStore.setUser(item));

          let chatInfo: ChatInfo;
          if (!chatsContext.state.chatsInfo.has(item.id)) {
            chatInfo = {
              id: item.id,
              name: item.name !== '' ? item.name : item.username,
              lastTxId: '',
              lastTxCurrency: 0,
              notificationCount: 0,
              timestamp: 0,
              type: ChatType.WithUser,
              details: null,
            };
          } else {
            chatInfo = chatsContext.state.chatsInfo.get(item.id)!;
          }

          navigation.navigate('Chat', {
            chatInfo: chatInfo,
          });
        }}
        underlayColor="#f8f9fb">
        <Contact
          name={item.name}
          img={{
            uri: backend.getImgUrl(item.id, item.lastUpdate),
          }}
          usernameOrPhoneNumber={'@' + item.username}
        />
      </TouchableHighlight>
    );
  };

  return (
    <View style={styles.users}>
      <View style={styles.searchBox}>
        {isLoading && (
          <ActivityIndicator
            testID="loader"
            size={25}
            color="#2AB2E2"
            style={{
              position: 'absolute',
              right: 10,
            }}
          />
        )}
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
      {searchString.length > 0 &&
        !isLoading &&
        (users === undefined || users.length === 0) && (
          <View
            style={{
              position: 'absolute',
              justifyContent: 'center',
              alignContent: 'center',
            }}>
            <Image
              source={require('assets/img/not-found.png')}
              style={{
                width: 70,
                height: 70,
                alignSelf: 'center',
              }}
            />
            <Text style={styles.noResultsText}>No results</Text>
          </View>
        )}
      <FlatList
        ListHeaderComponent={
          searchString.length === 0 ? (
            <TouchableHighlight
              onPress={() => {
                if (wallet == null) {
                  navigation.navigate('SelectWallet', {
                    isEditable: true,
                  });
                } else {
                  navigation.navigate('Send', {
                    isEditable: true,
                    wallet: wallet,
                  });
                }
              }}
              underlayColor="#f8f9fb">
              <SendBy
                title={'Send by address'}
                img={require('assets/img/address.png')}
              />
            </TouchableHighlight>
          ) : (
            <View />
          )
        }
        showsVerticalScrollIndicator={false}
        style={styles.list}
        data={isLoading ? [] : users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
  noResultsText: {
    marginTop: 10,
    fontSize: 19,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: '#888888',
  },
  list: {
    marginTop: 20,
    flex: 1,
    width: '100%',
  },
});
