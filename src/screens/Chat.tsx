import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {PaymentMsg} from 'components/PaymentMsg';
import {WalletLogo} from 'components/WalletLogo';
import {Transaction, TxOrMessage} from 'types/transaction';
import {Currency, Wallet} from 'types/wallet';
import {ChatInfo, ChatType, DefaultDetails} from 'types/chatInfo';
import ChatsStore from 'storage/Chats';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/Prices';
import GlobalStore from 'storage/Global';
import stringUtils from 'utils/string';
import StringUtils from 'utils/string';
import backend from 'utils/backend';
import {Message} from 'types/message';
import {MessageView} from 'components/MessageView';
import {ChatButton} from 'components/ChatButton';

/**
 * Chat screen
 * @category Screens
 */
export const Chat = ({navigation, route}: {navigation: any; route: any}) => {
  const flatListRef = useRef<FlatList>(null);

  const accountsContext = useContext(AccountsStore.Context);
  const priceContext = useContext(PricesStore.Context);
  const globalContext = useContext(GlobalStore.Context);
  const chatsContext = useContext(ChatsStore.Context);

  const chatInfo: ChatInfo = route.params.chatInfo;

  const [notificationCount] = useState(chatInfo.notificationCount);
  const [txs, setTxs] = useState<Array<TxOrMessage>>([]);

  const getWallet = (currency: Currency) => {
    let account = accountsContext.state.accounts.get(currency);
    let price = 0;
    if (priceContext.state.has(currency)) {
      price = priceContext.state.get(currency)!;
    }
    if (account === undefined) {
      throw new Error('invalid account');
    }
    return new Wallet(
      account.name,
      account.address,
      account.currency,
      account.network,
      account.balance,
      account.planks,
      price,
    );
  };

  useEffect(() => {
    const txsOrMessages = new Array<TxOrMessage>();
    if (!chatsContext.state.chats.has(chatInfo.id)) {
      return;
    }
    let ids = chatsContext.state.chats.get(chatInfo.id)!;

    ids.messages = [];
    ids.messages.push({
      id: '1000',
      value: 'Hello',
      timestamp: 1622716416000,
    });
    ids.messages.push({
      id: '10005',
      value:
        'Hello! I am Staking Bot. You can invest to staking with my help. Do you want?',
      timestamp: 1622716416000,
    });
    ids.messages.push({
      id: '10005',
      value:
        '😀 ☝ Hello How are you? Baby?  How are you? Baby?  How are you? Baby? How are you? Baby?  How are you? Baby?  How are you? Baby? How are you? Baby? adsa',
      timestamp: 1622716416000,
    });

    for (let [id, info] of ids.infoById) {
      const tx = chatsContext.state.transactions
        ?.get(info.currency)
        ?.transactionById.get(id)!;
      txsOrMessages.push({
        id: tx.id,
        isTx: true,
        value: tx,
        timestamp: tx.timestamp!,
      });
    }

    for (let msg of ids.messages) {
      txsOrMessages.push({
        id: msg.id,
        isTx: false,
        value: {
          id: msg.id,
          timestamp: msg.timestamp,
          value: msg.value,
        },
        timestamp: msg.timestamp,
      });
    }

    const result = txsOrMessages.sort((a, b) => b.timestamp - a.timestamp);
    setTxs(result);
  }, [chatsContext.state.chats]);

  const renderItem = ({item, index}: {item: TxOrMessage; index: number}) => {
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
            scaleY: -1,
          }}>
          <Text style={styles.newMsgText}>
            {StringUtils.texts.UnreadMessagesTitle}
          </Text>
        </View>
      );
    } //TODO: msg

    if (item.isTx) {
      const tx = item.value as Transaction;
      return (
        <>
          <TouchableOpacity
            style={{
              scaleY: -1,
            }}
            onPress={() =>
              navigation.navigate('TransactionDetails', {
                transaction: item,
                wallet: getWallet(tx.currency),
                user:
                  tx.userId != null && globalContext.state.users.has(tx.userId)
                    ? globalContext.state.users.get(tx.userId)!
                    : null,
              })
            }>
            <PaymentMsg tx={tx} />
          </TouchableOpacity>
          {line}
        </>
      );
    } else {
      const message = item.value as Message;
      return (
        <View style={{scaleY: -1}}>
          <MessageView value={message.value} timestamp={message.timestamp} />

          <View
            style={{
              paddingTop: 5,
              paddingBottom: 10,
              paddingLeft: 20,
              flexDirection: 'row',
            }}>
            <View
              style={{
                width: '20%',
              }}>
              <ChatButton text={'Send'} onPress={() => console.log('')} />
            </View>

            <View
              style={{
                paddingLeft: 10,
                width: '20%',
              }}>
              <ChatButton text={'Receive'} onPress={() => console.log('')} />
            </View>
          </View>
        </View>
      );
    }
  };

  useEffect(() => {
    navigation.setOptions({
      title: stringUtils.formatNameOrAddress(chatInfo.name),
      headerRight: () => {
        return chatInfo.type === ChatType.AddressOnly ? (
          <WalletLogo
            currency={(chatInfo.details as DefaultDetails).currency}
            size={45}
          />
        ) : (
          <Image
            source={{
              uri: backend.getImgUrl(
                globalContext.state.users.get(chatInfo.id)?.id ?? '0',
                globalContext.state.users.get(chatInfo.id)?.lastUpdate ?? 0,
              ),
            }}
            width={45}
            height={45}
            style={{width: 45, height: 45, borderRadius: 25}}
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
    if (notificationCount > txs.length) {
      index = txs.length;
    }
    flatListRef.current?.scrollToIndex({
      index: index - 1,
      viewPosition: 0.7,
      animated: true,
    });
  };

  return (
    <View style={styles.chat} onLayout={() => onLayout()}>
      <FlatList
        style={[{scaleY: -1}, styles.messages]}
        ref={flatListRef}
        scrollToOverflowEnabled={true}
        initialNumToRender={notificationCount < 10 ? 10 : notificationCount}
        data={txs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<View style={{marginBottom: 90}} />}
        onScrollToIndexFailed={() => {
          const wait = new Promise((resolve) => setTimeout(resolve, 100));
          wait.then(() => {
            scroll();
          });
        }}
      />
      {((chatInfo.type === ChatType.WithUser &&
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
