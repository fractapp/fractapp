import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {WalletLogo} from 'components/WalletLogo';
import backend from 'utils/api';
import { AddressOnly, Profile, User } from 'types/profile';
import UsersStore from 'storage/Users';
import { useSelector } from 'react-redux';
import Clipboard from '@react-native-community/clipboard';
import { showMessage } from 'react-native-flash-message';
import StringUtils from 'utils/string';
import { Currency } from 'types/wallet';
import formatNameOrAddress = StringUtils.formatNameOrAddress;

/**
 * Screen with transaction details
 * @category Screens
 */
export const ProfileInfo = ({navigation, route}: {navigation: any, route: any}) => {
    const usersState: UsersStore.State = useSelector((state: any) => state.users);

    const user: User = usersState.users[route.params.userId]!;

    const id = user.isAddressOnly ? (user.value as AddressOnly).address : (user.value as Profile).id;
    const name = user.isAddressOnly ? user.title : (user.value as Profile).name;
    const username = user.isAddressOnly ? '' : (user.value as Profile).username;

    const renderAddress = (address: string, currency: Currency) => {
        return (
          <TouchableOpacity
            onPress={() => {
                Clipboard.setString(address);
                showMessage({
                    message: StringUtils.texts.showMsg.addressCopied,
                    type: 'info',
                    icon: 'info',
                });
            }}
            style={styles.address}
            key={address}
          >
              <WalletLogo currency={currency} size={50} />

              <Text style={styles.addressText}>{address}</Text>
          </TouchableOpacity>
        );
    };
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', width: '90%', alignSelf: 'center' }}>
          <View style={{ paddingTop: 30 }}>
              <Image
                source={{
                    uri: backend.getImgUrl((user.value as Profile).id, (user.value as Profile).lastUpdate),
                }}
                width={150}
                height={150}
                style={styles.image}
              />
          </View>
          <View style={{ alignItems: 'center', marginTop: 15 }}>
              <Text style={styles.name}>{formatNameOrAddress(name !== '' ? name : '@' + username)}</Text>
              {
                  name !== '' && username !== '' ?
                    <Text style={[styles.username]}>@{username}</Text> :
                    <View />
              }
          </View>
          <View style={styles.buttonsBlock}>
              <View style={{ alignItems: 'flex-start', width: '50%' }}>
                  <TouchableOpacity
                    style={styles.btn}
                    onPress={() =>
                      !user.isAddressOnly
                        ? navigation.navigate('SelectWallet', {
                            chatId: id,
                        })
                        : navigation.navigate('Send', {
                            isEditable: false,
                            chatId: id,
                            currency: (user.value as AddressOnly).currency,
                        })
                    }>
                      <Text style={styles.btnText}>Send</Text>
                  </TouchableOpacity>
              </View>
              <View style={{ alignItems: 'flex-end', width: '50%'  }}>
                  <TouchableOpacity style={styles.btn}>
                      <Text style={styles.btnText}>Mute</Text>
                  </TouchableOpacity>
              </View>
          </View>
          <View style={{ width: '100%', marginTop: 30 }}>
              <Text style={styles.addressTitle}>Address</Text>
                  {
                      user.isAddressOnly
                        ?
                            renderAddress((user.value as AddressOnly).address, (user.value as AddressOnly).currency)
                        :
                            Object.entries((user.value as Profile).addresses).map((pair) => renderAddress(pair[1], Number(pair[0])))
                  }
              </View>
      </View>
    );
};

const styles = StyleSheet.create({
    image: {
        width: 150,
        height: 150,
        borderRadius: 90,
        alignSelf: 'center',
    },
    buttonsBlock: {
        flexDirection: 'row',
        marginTop: 30,
        width: '100%',
    },
    btn: {
        borderColor: '#2AB2E2',
        borderWidth: 1,
        width: '95%',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        color: '#2AB2E2',
        fontSize: 16,
        fontFamily: 'Roboto-Regular',
        fontStyle: 'normal',
        fontWeight: 'normal',
    },
    addressTitle: {
        color: 'black',
        fontSize: 16,
        fontFamily: 'Roboto-Bold',
        fontStyle: 'normal',
        fontWeight: 'normal',
    },
    address: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
    },
    addressText: {
        flex: 1,
        flexWrap: 'wrap',
        marginLeft: 15,
        color: 'black',
        fontSize: 16,
        fontFamily: 'Roboto-Regular',
        fontStyle: 'normal',
        fontWeight: 'normal',
    },
    name: {
        textAlign: 'center',
        fontSize: 16,
        fontFamily: 'Roboto-Bold',
        fontStyle: 'normal',
        fontWeight: 'normal',
        color: 'black',
    },
    username: {
        marginTop: 3,
        fontSize: 16,
        fontFamily: 'Roboto-Regular',
        fontStyle: 'normal',
        fontWeight: 'normal',
        color: '#888888',
    },
});
