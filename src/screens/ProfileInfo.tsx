import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {WalletLogo} from 'components/WalletLogo';
import backend from 'utils/api';
import { AddressOnly, Profile, User } from 'types/profile';
import UsersStore from 'storage/Users';
import { useSelector } from 'react-redux';

/**
 * Screen with transaction details
 * @category Screens
 */
export const ProfileInfo = ({route}: {navigation: any, route: any}) => {
    const usersState: UsersStore.State = useSelector((state: any) => state.users);

    const user: User = usersState.users[route.userId]!;

    const name = user.isAddressOnly ? user.title : (user.value as Profile).name;
    const username = user.isAddressOnly ? '' : ((user.value as Profile).name === '' ? (user.value as Profile).username : '');

    return (
      <View style={{ flexDirection: 'column', flex: 1, alignItems: 'center' }}>
          <View style={{ paddingLeft: 23, paddingRight: 22, paddingTop: 39 }}>
              <Image
                source={{
                    uri: backend.getImgUrl((user.value as Profile).id, (user.value as Profile).lastUpdate),
                }}
                width={130}
                height={130}
                style={styles.image}
              />
              <View style={{ alignItems: 'center', marginTop: 10 }}>
                  {
                      <View style={{ alignItems: 'center' }}>
                          <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{name}</Text>
                          {
                              username !== '' ?
                                <Text style={{ marginTop: 4, fontSize: 15, color: '#888888' }}>@{username}</Text> :
                                <View />
                          }
                      </View>
                  }
              </View>
              <View style={styles.buttonsBlock}>
                  <TouchableOpacity style={styles.sendBtn}>
                      <Text style={styles.btnText}>Send</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.muteBtn}>
                      <Text style={styles.btnText}>Mute</Text>
                  </TouchableOpacity>
              </View>
              <Text style={styles.addressTitle}>Address</Text>
              <View style={styles.addressBlock}>
                  {
                      user.isAddressOnly ?
                        <View style={styles.address} key={0}>
                            <WalletLogo currency={(user.value as AddressOnly).currency} size={40} />
                            <View style={{ width: '90%', flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.addressText}>{(user.value as AddressOnly).address}</Text>
                            </View>
                        </View> : Object.entries((user.value as Profile).addresses).map((pair) =>
                          (<View style={styles.address} key={pair[0]}>
                              <WalletLogo currency={Number(pair[0])} size={40} />
                              <View style={{ width: '90%', flexDirection: 'row', alignItems: 'center' }}>
                                  <Text style={styles.addressText}>{pair[1]}</Text>
                              </View>
                          </View>)
                        )
                  }
              </View>
          </View>
      </View>
    );
};

const styles = StyleSheet.create({
    image: {
        width: 130,
        height: 130,
        borderRadius: 90,
        alignSelf: 'center',
    },
    buttonsBlock: {
        flexDirection: 'row',
        marginTop: 25,
        width: '100%',
        height: 43,
    },
    sendBtn: {
        borderColor: '#2AB2E2',
        borderWidth: 1,
        width: 155,
        height: 43,
        borderRadius: 10,
        justifyContent: 'center',
        marginRight: 20,
    },
    muteBtn: {
        borderColor: '#2AB2E2',
        borderWidth: 1,
        width: 155,
        height: 43,
        borderRadius: 10,
        justifyContent: 'center',
    },
    btnText: {
        color: '#2AB2E2',
        textAlign: 'center',
    },
    addressTitle: {
        marginTop: 25,
        fontWeight: 'bold',
    },
    addressBlock: {
        alignSelf: 'center',
    },
    address: {
        flexDirection: 'row',
        marginTop: 15,
        justifyContent: 'flex-end',

    },
    addressText: {
        alignSelf: 'center',
        marginLeft: 15,
        justifyContent: 'center',
    },
    addAddress: {
        borderColor: '#2AB2E2',
        borderWidth: 1,
        width: 100,
        height: 43,
        borderRadius: 10,
        justifyContent: 'center',
    },
    imagePlus: {
        width: 12,
        height: 12,
        borderRadius: 90,
        alignSelf: 'center',
    },
    imageHuman: {
        width: 18,
        height: 19,
        borderRadius: 90,
        alignSelf: 'center',
    },
});
