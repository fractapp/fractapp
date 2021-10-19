import React, { useEffect, useState } from 'react';
import { FlatList, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WalletLogo } from 'components/WalletLogo';
import ChatsStore from 'storage/Chats';
import GlobalStore from 'storage/Global';
import stringUtils from 'utils/string';
import StringUtils from 'utils/string';
import backend from 'utils/api';
import {
  BroadcastArgs,
  Button,
  DefaultMsgAction,
  EnterAmountArgs,
  Message,
  OpenLinkArgs,
  TransactionViewArgs,
} from 'types/message';
import { MessageView } from 'components/MessageView';
import { AddressOnly, Profile, User } from 'types/profile';
import { PaymentMsg } from 'components/PaymentMsg';
import { Currency, getNetwork, toCurrency } from 'types/wallet';
import { randomAsHex } from '@polkadot/util-crypto';
import { useDispatch, useSelector } from 'react-redux';
import UsersStore from 'storage/Users';
import DialogStore from 'storage/Dialog';
import AccountsStore from 'storage/Accounts';
import { Adaptors } from 'adaptors/adaptor';
import { AccountType, Network } from 'types/account';
import ServerInfoStore from 'storage/ServerInfo';

/**
 * Chat screen
 * @category Screens
 */
export const Chat = ({navigation, route}: {navigation: any; route: any}) => {
  const globalState: GlobalStore.State = useSelector((state: any) => state.global);
  const usersState: UsersStore.State = useSelector((state: any) => state.users);
  const accountsState: AccountsStore.State = useSelector((state: any) => state.accounts);
  const chatsState: ChatsStore.State = useSelector((state: any) => state.chats);
  const serverInfoState: ServerInfoStore.State = useSelector((state: any) => state.serverInfo);

  const dispatch = useDispatch();

  const chatId: string = route.params.chatId;

  const chatInfo = chatsState.chatsInfo[chatId]!;
  const user: User = usersState.users[chatId]!;

  const [notificationCount] = useState(chatInfo.notificationCount);
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [lengthOffset, setLengthOffset] = useState<number>(0);

  const onPressChatBtn = async (msgId: string, btn: Button) => {
    switch (btn.action) {
      case DefaultMsgAction.EnterAmount:
        const enterAmountArgs = btn.arguments as EnterAmountArgs;
        //TODO: next release (normal validator)

        const currencyEnterAmount: Currency = toCurrency(enterAmountArgs.currency);

        navigation.navigate('EnterAmount', {
          chatId: chatId,
          msgId: msgId,
          isChatBotRequest: true,
          isUSDMode: true,
          value: '',
          currency: currencyEnterAmount,
          args: enterAmountArgs,
        });
        break;
      case DefaultMsgAction.OpenUrl:
        const linkArgs = btn.arguments as OpenLinkArgs;
        //TODO: next release (normal validator)

        await Linking.openURL(linkArgs.link); //TODO: next release alert (any site)
        break;
      case DefaultMsgAction.Broadcast:
        try {
          const broadcastArgs = btn.arguments as BroadcastArgs;
          //TODO: next release (normal validator)

          try {
            const tx = JSON.parse(broadcastArgs.unsignedTx);
            const currency: Currency = toCurrency(broadcastArgs.currency);

            const network: Network = getNetwork(currency);
            const api = Adaptors.get(network)!;

            dispatch(DialogStore.actions.showConfirmTxInfo(
              await api.parseTx((user.value as Profile),
                accountsState.accounts[AccountType.Main][currency],
                msgId,
                broadcastArgs,
                tx,
                serverInfoState.prices[currency])
              )
            );
          } catch (e) {
            console.log('Error: ' + (e as Error).toString());
          }
          dispatch(GlobalStore.actions.hideLoading());
        } catch (e) {
          console.log('broadcast err: ' + e);
          return;
        }
        break;
      default:
        let msg = {
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
        const timestamp = await backend.sendMsg({
          version: 1,
          value: btn.value,
          action: btn.action,
          receiver: chatInfo.id,
          args: btn.arguments,
        });
        if (timestamp == null) {
          return;
        }

        msg.timestamp = timestamp;

        dispatch(ChatsStore.actions.hideBtns({
          chatId: chatInfo.id,
          msgId: msgId,
        }));
        dispatch(ChatsStore.actions.addMessages([{
          chatId: chatInfo.id,
          msg: msg,
        }]));
        break;
    }
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
<<<<<<< HEAD
      <View
        key={item.id}
        style={{
        paddingLeft: 15,
        paddingRight: 15,
        scaleY: -1,
      }}>
=======
      <>
        <TouchableOpacity
          testID={'testNavigate'}
          style={{
            scaleY: -1,
          }}
          onPress={() =>
            navigation.navigate('TransactionDetails', {
              transaction: item,
              wallet: getWallet(item.currency),
              user:
                item.userId != null &&
                globalContext.state.users.has(item.userId)
                  ? globalContext.state.users.get(item.userId)!
                  : null,
            })
          }>
          <PaymentMsg tx={item} />
        </TouchableOpacity>
>>>>>>> fixing-tests
        {line}
        {
          item.action === '/tx' &&
          chatsState.transactions[toCurrency((item.args as TransactionViewArgs).currency)].transactionById[(item.args as TransactionViewArgs).id] ?
            (() => {
              const tx = chatsState.transactions[toCurrency((item.args as TransactionViewArgs).currency)].transactionById[(item.args as TransactionViewArgs).id];
              return <PaymentMsg
                onPress={() =>
                  navigation.navigate('TransactionDetails', {
                    transaction: tx,
                  })}
                tx={{
                  id: tx.id,
                  hash: tx.hash,
                  fullValue: tx.fullValue,
                  userId: tx.userId,
                  address: tx.address,
                  action: tx.action,
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
<<<<<<< HEAD
    <View style={styles.chat}>
      {<FlatList
        style={[{scaleY: -1 }, styles.messages]}
        windowSize={5}
        data={messages}
=======
    <View style={styles.chat} onLayout={() => onLayout()}>
      <FlatList
        testID={'testFlatList'}
        style={[{scaleY: -1}, styles.messages]}
        ref={flatListRef}
        scrollToOverflowEnabled={true}
        initialNumToRender={notificationCount < 10 ? 10 : notificationCount}
        data={txs}
>>>>>>> fixing-tests
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<View style={{marginBottom: user.isAddressOnly || !(user.value as Profile).isChatBot ? 80 : 50}}  />}
      />}
      {((user.isAddressOnly || !(user.value as Profile).isChatBot) &&
        <TouchableOpacity
          testID={'testGetWallet'}
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
      {(!user.isAddressOnly && (user.value as Profile).isChatBot) && messages.length === 0 &&
        <TouchableOpacity
          style={styles.sendBox}
          onPress={() => {
            const msg = {
              id: 'answer-' + randomAsHex(32),
              value: 'Start',
              action: DefaultMsgAction.Init,
              args: {},
              rows: [],
              timestamp: Date.now(),
              sender: globalState.profile!.id,
              receiver: chatInfo.id,
              hideBtn: true,
            };
            backend.sendMsg({
              version: 1,
              value: msg.value,
              action: msg.action,
              receiver: chatInfo.id,
              args: msg.args,
            }).then((timestamp) => {
              if (timestamp != null) {
                msg.timestamp = timestamp;
                dispatch(ChatsStore.actions.addMessages([{
                  chatId: chatInfo.id,
                  msg: msg,
                }]));
              }
            });
          }}
        >
          <Text style={styles.startBtnText}>Start</Text>
        </TouchableOpacity>
      }
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
  startBtnText: {
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'white',
  },
});
