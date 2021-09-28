import React, { useEffect } from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {WalletLogo} from 'components/WalletLogo';
import backend from 'utils/api';
import { AddressOnly, Profile, User } from 'types/profile';
import UsersStore from 'storage/Users';
import { useDispatch, useSelector } from 'react-redux';
import Clipboard from '@react-native-community/clipboard';
import { showMessage } from 'react-native-flash-message';
import StringUtils from 'utils/string';
import { Currency } from 'types/wallet';
import formatNameOrAddress = StringUtils.formatNameOrAddress;
import ChatsStore from 'storage/Chats';
import { randomAsHex } from '@polkadot/util-crypto';
import GlobalStore from 'storage/Global';

/**
 * Screen with transaction details
 * @category Screens
 */
export const ProfileInfo = ({navigation, route}: {navigation: any, route: any}) => {
    const dispatch = useDispatch();
    const usersState: UsersStore.State = useSelector((state: any) => state.users);
    const chatsState: ChatsStore.State = useSelector((state: any) => state.chats);
    const globalState: GlobalStore.State = useSelector((state: any) => state.global);

    const user: User = usersState.users[route.params.userId]!;

    const id = user.isAddressOnly ? (user.value as AddressOnly).address : (user.value as Profile).id;
    const isChatBot = !user.isAddressOnly && (user.value as Profile).isChatBot;
    const name = user.isAddressOnly ? user.title : (user.value as Profile).name;
    const username = user.isAddressOnly ? '' : (user.value as Profile).username;

    useEffect(() => {
        navigation.setOptions({
            title: name !== '' ? name : username,
        });
    }, []);

    const restartChatBot = () => {
        const msg = {
            id: 'answer-' + randomAsHex(32),
            value: 'Start',
            action: '/init',
            args: [],
            rows: [],
            timestamp: Date.now(),
            sender: globalState.profile!.id,
            receiver: id,
            hideBtn: true,
        };
        backend.sendMsg({
            version: 1,
            value: msg.value,
            action: msg.action,
            receiver: id,
            args: msg.args,
        }).then((timestamp) => {
            if (timestamp != null) {
                msg.timestamp = timestamp;
                dispatch(ChatsStore.actions.addMessages([{
                    chatId: id,
                    msg: msg,
                }]));
                navigation.reset({
                    index: 1,
                    routes: [
                        { name: 'Home' },
                        { name: 'Chat', params: { chatId: id } },
                    ],
                });
            }
        });
    };

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
                        ? (
                          isChatBot ?
                            restartChatBot()
                            : navigation.navigate('SelectWallet', {
                                chatId: id,
                            })
                        )
                        : navigation.navigate('Send', {
                            isEditable: false,
                            chatId: id,
                            currency: (user.value as AddressOnly).currency,
                        })
                    }>
                      <Text style={styles.btnText}>{isChatBot ? StringUtils.texts.profile.restartBtn : StringUtils.texts.profile.sendBtn}</Text>
                  </TouchableOpacity>
              </View>
              <View style={{ alignItems: 'flex-end', width: '50%'  }}>
                  <TouchableOpacity
                    disabled={chatsState.chatsInfo[id].lastMsgId === null}
                    style={chatsState.chatsInfo[id].lastMsgId === null ? styles.disabledBtn : styles.btn}
                    onPress={() => {
                        console.log('delete');
                        dispatch(ChatsStore.actions.removeChat(id));
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Home' }],
                        });
                    }}
                  >
                      <Text style={chatsState.chatsInfo[id].lastMsgId === null ? styles.disabledBtnText : styles.btnText}>
                          {StringUtils.texts.profile.deleteBtn}
                      </Text>
                  </TouchableOpacity>
              </View>
          </View>
          <View style={{ width: '100%', marginTop: 30 }}>
              <Text style={styles.addressTitle}>{StringUtils.texts.profile.addressesTitle}</Text>
                  {
                      user.isAddressOnly
                        ?
                            renderAddress((user.value as AddressOnly).address, (user.value as AddressOnly).currency)
                        :
                            Object.entries((user.value as Profile)!.addresses ?? []).map((pair) => renderAddress(pair[1], Number(pair[0])))
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
    disabledBtn: {
        borderColor: '#BFBDBD',
        borderWidth: 1,
        width: '95%',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledBtnText: {
        color: '#BFBDBD',
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
