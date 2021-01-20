import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import {PaymentMsg} from 'components/index';
import {Transaction} from 'models/transaction';
import {WalletLogo} from 'components/WalletLogo';
import ChatsStore from 'storage/Chats';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/Prices';
import {Currency, Wallet} from 'models/wallet';
import GlobalStore from 'storage/Global';
import stringUtils from 'utils/string';

export const Chat = ({navigation, route}: {navigation: any; route: any}) => {
  const flatListRef = useRef<FlatList>(null);

  const accountContext = useContext(AccountsStore.Context);
  const priceContext = useContext(PricesStore.Context);
  const globalContext = useContext(GlobalStore.Context);
  const chatsContext = useContext(ChatsStore.Context);

  const chatInfo = route.params.chatInfo;
  const avatar = route.params?.avatar;
  const [notificationCount] = useState(chatInfo.notificationCount);
  const getWallet = (currency: Currency) => {
    let account = accountContext.state.get(currency);
    let price = priceContext.state.get(currency);
    if (price === undefined) {
      price = 0;
    }
    if (account === undefined) {
      throw 'invalid account';
    }
    return new Wallet(
      account.name,
      account.address,
      account.currency,
      account.balance,
      price,
    );
  };
  const getTxs = () => {
    return Array.from(
      chatsContext.state.chats.get(chatInfo.addressOrName)?.values() ?? [],
    ).sort((a, b) => a.timestamp - b.timestamp);
  };
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
      title: stringUtils.formatNameOrAddress(chatInfo.addressOrName),
      headerRight: () => {
        return avatar == null ? (
          <WalletLogo currency={chatInfo.currency} size={45} />
        ) : (
          <Image
            source={avatar}
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
      chatsContext.dispatch(
        ChatsStore.resetNotification(chatInfo.addressOrName),
      );
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
        data={getTxs()}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<View style={{marginBottom: 90}} />}
      />
      <TouchableOpacity
        style={styles.sendBox}
        onPress={() =>
          chatInfo.currency == null
            ? navigation.navigate('SelectWallet')
            : navigation.navigate('Send', {
                receiver: chatInfo.addressOrName,
                wallet: getWallet(chatInfo.currency),
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
