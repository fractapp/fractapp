import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WalletLogo } from 'components/WalletLogo';
import ChatsStore from 'storage/Chats';
import GlobalStore from 'storage/Global';
import stringUtils from 'utils/string';
import StringUtils from 'utils/string';
import backend from 'utils/api';
import { Button, Message } from 'types/message';
import { MessageView } from 'components/MessageView';
import { AddressOnly, Profile, User } from 'types/profile';
import { PaymentMsg } from 'components/PaymentMsg';
import { toCurrency } from 'types/wallet';
import { randomAsHex } from '@polkadot/util-crypto';
import { useDispatch, useSelector } from 'react-redux';
import UsersStore from 'storage/Users';

/**
 * Chat screen
 * @category Screens
 */
export const Chat = ({navigation, route}: {navigation: any; route: any}) => {
  const globalState: GlobalStore.State = useSelector((state: any) => state.global);
  const usersState: UsersStore.State = useSelector((state: any) => state.users);
  const chatsState: ChatsStore.State = useSelector((state: any) => state.chats);
  const dispatch = useDispatch();

  const chatId: string = route.params.chatId;

  const chatInfo = chatsState.chatsInfo[chatId]!;
  const user: User = usersState.users[chatId]!;

  const [notificationCount] = useState(chatInfo.notificationCount);
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [lengthOffset, setLengthOffset] = useState<number>(0);

  const onPressChatBtn = async (msgId: string, btn: Button) => {
    const msg = {
      id: 'answer-' + randomAsHex(32),
      value: btn.value,
      action: btn.action,
      args: btn.arguments,
      rows: [],
      timestamp: Date.now(),
      sender: globalState.profile!.id,
      receiver: chatInfo.id,
      hideBtn: true,
    };
    const isOk = await backend.sendMsg({
      version: 1,
      value: btn.value,
      action: btn.action,
      receiver: chatInfo.id,
      args: btn.arguments,
    });
    if (!isOk) {
      return;
    }

    dispatch(ChatsStore.actions.hideBtns({
      chatId: chatInfo.id,
      msgId: msgId,
    }));
    dispatch(ChatsStore.actions.addMessages([{
      chatId: chatInfo.id,
      msg: msg,
    }]));
  };

  useEffect(() => {
    navigation.setOptions({
      title: stringUtils.formatNameOrAddress(user.title),
      headerRight: () => {
        return (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ProfileInfo', {
                userId: chatInfo.id,
              })
            }
          >
            {user.isAddressOnly ?
              <WalletLogo
                currency={(user.value as AddressOnly).currency}
                size={45}
              /> :
              <Image
                source={{
                  uri: backend.getImgUrl((user.value as Profile).id, (user.value as Profile).lastUpdate),
                }}
                width={45}
                height={45}
                style={{ width: 45, height: 45, borderRadius: 25 }}
              />
            }
          </TouchableOpacity>
        );
      },
      headerRightContainerStyle: {
        marginRight: 20,
      },
    });
  }, []);

  useEffect(() => {
    const newMessages =
      Object.keys(chatsState.chats[chatInfo.id].messages)
      .map((key) => chatsState.chats[chatInfo.id].messages[key])
      .sort((a, b) => b.timestamp - a.timestamp);

    setMessages(newMessages);
    setLengthOffset(messages.length === 0 ? 0 : lengthOffset + (messages.length - newMessages.length));
  }, [chatsState.chats[chatInfo.id].messages]);

  useEffect(() => {
    if (chatInfo.notificationCount !== 0) {
      dispatch(ChatsStore.actions.removeNotification(chatInfo.id));
    }
  }, [chatInfo.notificationCount]);

  const renderItem = ({item, index}: {item: Message; index: number}) => {
    let line;
    if (notificationCount !== 0 && index === notificationCount - lengthOffset - 1) {
      line = (
        <View
          style={{
            marginTop: 10,
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={styles.newMsgText}>
            {StringUtils.texts.UnreadMessagesTitle}
          </Text>
        </View>
      );
    }

    return (
      <View
        key={item.id}
        style={{
        paddingLeft: 15,
        paddingRight: 15,
        scaleY: -1,
      }}>
        {line}
        {
          item.action === '/tx' &&
          item.args.length >= 2 &&
          chatsState.transactions[toCurrency(item.args[0])].transactionById[item.args[1]] ?
            (() => {
              const tx = chatsState.transactions[toCurrency(item.args[0])].transactionById[item.args[1]];
              return <PaymentMsg
                onPress={() =>
                  navigation.navigate('TransactionDetails', {
                    transaction: tx,
                  })}
                tx={{
                  id: tx.id,
                  hash: tx.hash,
                  userId: tx.userId,
                  address: tx.address,
                  currency: tx.currency,
                  txType: tx.txType,
                  timestamp: tx.timestamp,
                  value: tx.value,
                  planckValue: tx.planckValue,
                  usdValue: tx.usdValue,
                  fee: tx.fee,
                  planckFee: tx.planckFee,
                  usdFee: tx.usdFee,
                  status: tx.status,
                }} />;
            })() :
            (<MessageView key={item.id} message={item} isOwner={item.sender === globalState.profile!.id}
                          onPressChatBtn={onPressChatBtn} />)
        }
      </View>
    );
  };

  return (
    <View style={styles.chat}>
      {<FlatList
        style={[{scaleY: -1 }, styles.messages]}
        getItemLayout={ (data, index) => (
          { length: 50, offset: 50 * index, index }
        )}
        windowSize={5}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<View style={{marginBottom: user.isAddressOnly || !(user.value as Profile).isChatBot ? 80 : 50}}  />}
      />}
      {((user.isAddressOnly || !(user.value as Profile).isChatBot) &&
        <TouchableOpacity
          style={styles.sendBox}
          onPress={() =>
            !user.isAddressOnly
              ? navigation.navigate('SelectWallet', {
                chatId: chatInfo.id,
              })
              : navigation.navigate('Send', {
                isEditable: false,
                chatId: chatInfo.id,
                currency: (user.value as AddressOnly).currency,
              })
          }>
          <Image
            source={require('assets/img/send.png')}
            style={{width: 16, height: 25}}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonText: {
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'white',
  },
  sendBox: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    height: 60,
    width: 60,
    borderRadius: 50,
    backgroundColor: '#2AB2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chat: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
  },
  messages: {
    width: '100%',
  },
  dividingLine: {
    width: '100%',
    height: 0.5,
    backgroundColor: '#C5C5C5',
  },
  newMsgDividingLine: {
    width: '15%',
    height: 1,
    borderColor: '#2AB2E2',
    borderBottomWidth: 1,
  },
  newMsgText: {
    textAlign: 'center',
    width: '100%',
    backgroundColor: '#51caf5',
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'white',
  },
});
