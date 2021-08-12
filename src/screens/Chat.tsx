import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WalletLogo } from 'components/WalletLogo';
import { ChatInfo } from 'types/chatInfo';
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

  const chatInfo: ChatInfo = route.params.chatInfo;

  const flatListRef = useRef<FlatList>(null);

  const user: User = usersState.users[chatInfo.id]!;

  const [notificationCount] = useState(chatInfo.notificationCount);
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [messagesBBB, setMessagesBBB] = useState<Array<Message>>([]);

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
    if (isOk) {
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
    setMessagesBBB(
      Object.keys(chatsState.chats[chatInfo.id].messages)
        .map((key) => chatsState.chats[chatInfo.id].messages[key])
        .sort((a, b) => b.timestamp - a.timestamp)
    );
  }, []);

  useEffect(() => {
    setMessages(
      Object.keys(chatsState.chats[chatInfo.id].messages)
        .map((key) => chatsState.chats[chatInfo.id].messages[key])
        .sort((a, b) => b.timestamp - a.timestamp)
    );
  }, [chatsState.chats[chatInfo.id].messages]);

  useEffect(() => {
    if (chatInfo.notificationCount !== 0) {
      dispatch(ChatsStore.actions.removeNotification(chatInfo.id));
    }
  }, [chatInfo.notificationCount]);

  const onLayout = () => {
    if (notificationCount > 0 && flatListRef && flatListRef.current) {
      console.log('scroll');
      scroll();
    }
  };

  const renderItem = ({item, index}: {item: Message; index: number}) => {
    let line;
    if (notificationCount !== 0 && index === notificationCount - 1) {
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
      <View style={{
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
            (<MessageView key={index} message={item} isOwner={item.sender === globalState.profile!.id}
                          onPressChatBtn={onPressChatBtn} />)
        }
      </View>
    );
  };

  const scroll = () => {
    let index = notificationCount;
    if (notificationCount > messages.length) {
      index = messages.length;
    }
    flatListRef.current?.scrollToIndex({
      index: index - 1,
      viewPosition: 0.7,
      animated: true,
    });
  };

  return (
    <View style={styles.chat} onLayout={() => onLayout()}>
      {<FlatList
        style={[{scaleY: -1 }, styles.messages]}
        getItemLayout={ (data, index) => (
          { length: 50, offset: 50 * index, index }
        )}
        ref={flatListRef}
        scrollToOverflowEnabled={false}
        windowSize={5}
        data={messagesBBB}
        extraData={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={<View style={{marginBottom: user.isAddressOnly || !(user.value as Profile).isChatBot ? 80 : 50}}  />}
        onScrollToIndexFailed={() => {
          const wait = new Promise((resolve) => setTimeout(resolve, 100));
          wait.then(() => {
            scroll();
          });
        }}
      />}
      {((user.isAddressOnly || !(user.value as Profile).isChatBot) &&
        <TouchableOpacity
          style={styles.sendBox}
          onPress={() =>
            !user.isAddressOnly
              ? navigation.navigate('SelectWallet', {
                  chatInfo: chatInfo,
                })
              : navigation.navigate('Send', {
                  isEditable: false,
                  chatInfo: chatInfo,
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
