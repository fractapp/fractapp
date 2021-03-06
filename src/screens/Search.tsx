import React, {useContext, useEffect, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableHighlight,
  View,
  PermissionsAndroid,
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
import {ChatType} from 'types/chatInfo';

export const Search = ({navigation, route}: {navigation: any; route: any}) => {
  const wallet: Wallet = route.params?.wallet;

  const globalContext = useContext(GlobalStore.Context);
  const dialogContext = useContext(DialogStore.Context);
  const [searchString, setSearchString] = useState<string>('');
  const [users, setUsers] = useState<Array<UserProfile>>();

  useEffect(() => {
    getMyMatchContacts();
    if (!globalContext.state.isRegistered) {
      return;
    }

    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
    ).then(async (status) => {
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
    });
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
    if (searchString.length === 0) {
      const contacts = new Array<UserProfile>();
      for (let id of globalContext.state.contacts) {
        if (!globalContext.state.users.has(id)) {
          continue;
        }
        contacts.push(globalContext.state.users.get(id)!);
      }
      setUsers(contacts);
    } else {
      if (searchString[0] === '@') {
        backend.search(searchString.split('@')[1], false).then((users) => {
          setUsers(
            users.filter((user) => user.id !== globalContext.state.profile.id),
          );
        });
      } else {
        backend.search(searchString, true).then((users) => {
          setUsers(
            users.filter((user) => user.id !== globalContext.state.profile.id),
          );
        });
      }
    }
  }, [searchString]);

  const renderItem = ({item}: {item: any}) => {
    return (
      <TouchableHighlight
        onPress={() => {
          globalContext.dispatch(GlobalStore.setUser(item));

          navigation.navigate('Chat', {
            chatInfo: {
              id: item.id,
              name: item.name,
              lastTxId: '',
              lastTxCurrency: 0,
              notificationCount: 0,
              timestamp: 0,
              type: ChatType.Chat,
              details: null,
            },
          });
        }}
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
        ListHeaderComponent={
          <TouchableHighlight
            onPress={() => {
              if (wallet == null) {
                navigation.navigate('SelectWallet', {
                  isEditable: true,
                });
              } else {
                navigation.navigate('Send', {isEditable: true, wallet: wallet});
              }
            }}
            underlayColor="#f8f9fb">
            <SendBy
              title={'Send by address'}
              img={require('assets/img/address.png')}
            />
          </TouchableHighlight>
        }
        showsVerticalScrollIndicator={false}
        style={styles.list}
        data={users}
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
  list: {
    marginTop: 20,
    flex: 1,
    width: '100%',
  },
});
