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
import {Transaction} from 'types/transaction';
import {Currency, Wallet} from 'types/wallet';
import {ChatInfo, ChatType, DefaultDetails} from 'types/chatInfo';
import ChatsStore from 'storage/Chats';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/Prices';
import GlobalStore from 'storage/Global';
import TransactionsStore from 'storage/Transactions';
import stringUtils from 'utils/string';
import backend from 'utils/backend';

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
  const transactionsContext = useContext(TransactionsStore.Context);

  const chatInfo: ChatInfo = route.params.chatInfo;

  const [notificationCount, setNotificationCount] = useState(
    chatInfo.notificationCount,
  );
  const [txs, setTxs] = useState<Array<Transaction>>([]);

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
      account.balance,
      account.planks,
      price,
    );
  };

  useEffect(() => {
    const txs = new Array<Transaction>();
    if (!chatsContext.state.chats.has(chatInfo.id)) {
      return;
    }
    const ids = chatsContext.state.chats.get(chatInfo.id)!;

    for (let [id, currency] of ids) {
      txs.push(transactionsContext.state.transactions?.get(currency)?.get(id)!);
    }
    const result = txs.sort((a, b) => b.timestamp - a.timestamp);
    if (result.length < notificationCount) {
      //TODO
      setNotificationCount(result.length);
    }
    setTxs(result);
  }, [chatsContext.state.chats]);

  const renderItem = ({item, index}: {item: Transaction; index: number}) => {
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
          <View
            style={[
              styles.newMsgDividingLine,
              {position: 'absolute', left: 20},
            ]}
          />
          <Text style={styles.newMsgText}>Unread messages</Text>
          <View
            style={[
              styles.newMsgDividingLine,
              {position: 'absolute', right: 20},
            ]}
          />
        </View>
      );
    }

    return (
      <>
        <TouchableOpacity
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
        {line}
      </>
    );
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
                globalContext.state.users.get(chatInfo.id)!.id,
                globalContext.state.users.get(chatInfo.id)!.avatarExt,
                globalContext.state.users.get(chatInfo.id)!.lastUpdate,
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
      globalContext.dispatch(
        GlobalStore.removeNotificationCount(notificationCount),
      );
      chatsContext.dispatch(ChatsStore.resetNotification(chatInfo.id));
    }
  }, [chatInfo.notificationCount]);

  const onLayout = () => {
    if (notificationCount > 0 && flatListRef && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: notificationCount - 1,
        viewPosition: 0.7,
      });
    }
  };

  return (
    <View style={styles.chat} onLayout={() => onLayout()}>
      <FlatList
        inverted
        style={styles.messages}
        ref={flatListRef}
        scrollToOverflowEnabled={true}
        initialNumToRender={notificationCount < 10 ? 10 : notificationCount}
        data={txs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<View style={{marginBottom: 90}} />}
      />
      <TouchableOpacity
        style={styles.sendBox}
        onPress={() =>
          chatInfo.type === ChatType.Chat
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
    width: '27%',
    height: 1,
    borderColor: '#2AB2E2',
    borderBottomWidth: 1,
  },
  newMsgText: {
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: '#2AB2E2',
  },
});
