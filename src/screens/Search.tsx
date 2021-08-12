import React, {useEffect, useState} from 'react';
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
import backend from 'utils/api';
import GlobalStore from 'storage/Global';
import Dialog from 'storage/Dialog';
import {Profile} from 'types/profile';
import {ChatInfo} from 'types/chatInfo';
import StringUtils from 'utils/string';
import { useDispatch, useSelector } from 'react-redux';
import UsersStore from 'storage/Users';
import ChatsStore from 'storage/Chats';
import { Account } from 'types/account';

/**
 * Users search screen
 * @category Screens
 */
export const Search = ({navigation, route}: {navigation: any; route: any}) => {
  const dispatch = useDispatch();
  const globalState: GlobalStore.State = useSelector((state: any) => state.global);
  const usersState: UsersStore.State = useSelector((state: any) => state.users);
  const chatsState: ChatsStore.State = useSelector((state: any) => state.chats);

  const account: Account = route.params?.wallet;

  const [searchString, setSearchString] = useState<string>('');
  const [users, setUsers] = useState<Array<Profile>>();
  const [isLoading, setLoading] = useState<boolean>();
  const [lastSearch, setLastSearch] = useState<string>();

  useEffect(() => {
    if (!globalState.isRegisteredInFractapp) {
      return;
    }
    getMyMatchContacts();

    (async () => {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      );
      if (status === 'never_ask_again') {
        dispatch(
          Dialog.actions.showDialog({
              title: StringUtils.texts.OpenSettingsTitle,
              text: StringUtils.texts.OpenSettingsForContactsText,
            }
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
      (user) => user.id !== globalState.profile!.id,
    );
    setUsers(contacts);
    const ids = new Array<string>();
    for (let user of contacts) {
      dispatch(UsersStore.actions.setUser({
        title: user?.name! !== '' ? user?.name! : user?.username!,
        isAddressOnly: false,
        value: user,
      }));
      ids.push(user.id);
    }

    dispatch(UsersStore.actions.setContacts(ids));
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
      const contacts: Array<Profile> = [];
      for (let id of usersState.contacts) {
        if (!usersState.users[id]) {
          continue;
        }
        contacts.push((usersState.users[id]!.value as Profile));
      }
      setUsers(contacts);
      setLoading(false);
    } else {
      backend
        .search(searchString)
        .then((users: Profile[]) => {
          setUsers(
            users.filter((user) => user.id !== globalState.profile!.id),
          );
          setTimeout(() => setLoading(false), 1000);
        })
        .catch(() => setTimeout(() => setLoading(false), 1000));
    }
  }, [searchString, isLoading]);

  const renderItem = ({item}: {item: Profile}) => {
    return (
      <TouchableHighlight
        onPress={() => {
          dispatch(UsersStore.actions.setUser({
            title: item?.name! !== '' ? item?.name! : item?.username!,
            isAddressOnly: false,
            value: item,
          }));

          let chatInfo: ChatInfo;
          if (!chatsState.chatsInfo[item.id]) {
            chatInfo = {
              id: item.id,
              notificationCount: 0,
              lastMsgId: '',
            };
          } else {
            chatInfo = chatsState.chatsInfo[item.id]!;
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
          placeholder={StringUtils.texts.SearchPlaceholder}
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
                source={require('assets/img/not-found-bot.png')}
                style={{
                  width: 200,
                  height: 200,
                  alignSelf: 'center',
                  marginRight: 25,
                }}
                resizeMode="center"
              />
              <Text style={styles.noResultsText}>
                {StringUtils.texts.NoResultsTitle}
              </Text>
          </View>
        )}
      <FlatList
        ListHeaderComponent={
          searchString.length === 0 ? (
            <TouchableHighlight
              onPress={() => {
                if (account == null) {
                  navigation.navigate('SelectWallet', {
                    isEditable: true,
                  });
                } else {
                  navigation.navigate('Send', {
                    isEditable: true,
                    currency: account.currency,
                  });
                }
              }}
              underlayColor="#f8f9fb">
              <SendBy
                title={StringUtils.texts.SendByAddressBtn}
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
    alignSelf: 'center',
  },
  list: {
    marginTop: 20,
    flex: 1,
    width: '100%',
  },
});
