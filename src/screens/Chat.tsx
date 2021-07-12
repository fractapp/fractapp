import React, { useContext, useEffect, useRef, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WalletLogo } from 'components/WalletLogo';
import { ChatInfo } from 'types/chatInfo';
import ChatsStore from 'storage/Chats';
import GlobalStore from 'storage/Global';
import stringUtils from 'utils/string';
import StringUtils from 'utils/string';
import backend from 'utils/api';
import { Button, Message } from 'types/message';
import { MessageView } from 'components/MessageView';
import { AddressOnly, Profile } from 'types/profile';
import { PaymentMsg } from 'components/PaymentMsg';
import { Currency } from 'types/wallet';
import { TxStatus, TxType } from 'types/transaction';
import { randomAsHex } from '@polkadot/util-crypto';
import websocket from 'utils/websocket';

/**
 * Chat screen
 * @category Screens
 */
export const Chat = ({navigation, route}: {navigation: any; route: any}) => {
  const flatListRef = useRef<FlatList>(null);

  const globalContext = useContext(GlobalStore.Context);
  const chatsContext = useContext(ChatsStore.Context);

  const chatInfo: ChatInfo = route.params.chatInfo;
  const user = globalContext.state.users.get(chatInfo.id)!;

  const [notificationCount] = useState(chatInfo.notificationCount);
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [lastHideBtnMsgId, setLastHideBtnMsgId] = useState<string>('');

  const data = [ ...chatsContext.state.chats.get(chatInfo.id)!.messages.values() ].sort((a, b) => b.timestamp - a.timestamp);
  const onPressChatBtn = async (msgId: string, btn: Button) => {
    const msg = {
      id: 'answer-' + randomAsHex(32),
      value: btn.value,
      args: btn.arguments,
      rows: [],
      timestamp: Date.now(),
      sender: globalContext.state.profile.id,
      receiver: chatInfo.id,
      hideBtn: true,
    };
    await websocket.getWsApi().sendMsg({
      version: 1,
      value: btn.value,
      receiver: chatInfo.id,
      args: btn.arguments,
    });
    chatsContext.dispatch(ChatsStore.addMsg(chatInfo.id, msg));
    setLastHideBtnMsgId(msgId);
    chatsContext.dispatch(ChatsStore.hideBtnsInMsg(chatInfo.id, msgId));
  };

 /* useEffect(() => {
    const messages = new Array<Message>();
    if (!chatsContext.state.chats.has(chatInfo.id)) {
      return;
    }
    let ids = chatsContext.state.chats.get(chatInfo.id)!;

    for (let [id, msg] of ids.messages) {
      messages.push(msg);
    }
    const result = messages.sort((a, b) => b.timestamp - a.timestamp);
    setMessages(result);
    setLastHideBtnMsgId('');
  }, [chatsContext.state.chatsInfo]);*/

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
          item.value === '/tx' ?
            <PaymentMsg tx={{
              id: 'id',
              hash: 'hash',
              userId: 'userId',
              address: 'address',
              currency: Currency.DOT,
              txType: TxType.Received,
              timestamp: 100000000,

              value: 1000,
              planckValue: '100000',
              usdValue: 100,

              fee: 1000,
              planckFee: '1000',
              usdFee: 1000,
              status: TxStatus.Pending,
            }} /> :
              (<MessageView isHideAnimation={item.id === lastHideBtnMsgId} message={item} isOwner={item.sender === globalContext.state.profile.id}
                            onPressChatBtn={onPressChatBtn} />)
        }
      </View>
    );
  };

  useEffect(() => {
    navigation.setOptions({
      title: stringUtils.formatNameOrAddress(user.title),
      headerRight: () => {
          const user = globalContext.state.users.get(chatInfo.id)!;
          return user.isAddressOnly ? (
            <WalletLogo
              currency={(user.value as AddressOnly).currency}
              size={45}
            />
          ) : (
            <Image
              source={{
                uri: backend.getImgUrl(
                  (user.value as Profile).id,
                  (user.value as Profile).lastUpdate,
                ),
              }}
              width={45}
              height={45}
              style={{ width: 45, height: 45, borderRadius: 25 }}
            />
          );
      },
      headerRightContainerStyle: {
        marginRight: 20,
      },
    });
  }, []);
  useEffect(() => {
    if (chatInfo.notificationCount !== 0) {
      chatsContext.dispatch(ChatsStore.removeNotification(chatInfo.id));
    }
  }, [chatInfo.notificationCount]);

  const onLayout = () => {
    if (notificationCount > 0 && flatListRef && flatListRef.current) {
      scroll();
    }
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

      {/*<ScrollView style={{ scaleY: -1 }}>
        {data.map((value, index) => {
          if (index < 10) {
            return renderItem({ item: value, index: index });
          }
        })
        }
      </ScrollView>*/
      }
      {/*<FlatList
        style={[{scaleY: -1}, styles.messages]}
        ref={flatListRef}
        scrollToOverflowEnabled={true}
        initialNumToRender={notificationCount < 10 ? 10 : notificationCount}
        data={data.slice(0, 10)}
        renderItem={renderItem}
        keyExtractor={(item, index) => String(index)}
        ListHeaderComponent={<View style={{marginBottom: 50}}  />}
        onScrollToIndexFailed={() => {
          const wait = new Promise((resolve) => setTimeout(resolve, 100));
          wait.then(() => {
            scroll();
          });
        }}
      />*/}
      {/*((chatInfo.type === ChatType.WithUser &&
        globalContext.state.users.get(chatInfo.id) !== undefined) ||
        chatInfo.type === ChatType.AddressOnly) && (
        <TouchableOpacity
          style={styles.sendBox}
          onPress={() =>
            chatInfo.type === ChatType.WithUser
              ? navigation.navigate('SelectWallet', {
                  chatInfo: chatInfo,
                })
              : navigation.navigate('Send', {
                  isEditable: false,
                  chatInfo: chatInfo,
                  wallet: getWallet(
                    (chatInfo.details as DefaultDetails).currency,
                  ),
                })
          }>
          <Image
            source={require('assets/img/send.png')}
            style={{width: 16, height: 25}}
          />
        </TouchableOpacity>
      )*/}
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
