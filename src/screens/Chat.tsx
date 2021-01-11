import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import {PaymentMsg} from 'components';
import {Transaction} from 'models/transaction';
import {WalletLogo} from 'components/WalletLogo';
import ChatsStore from 'storage/Chats';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/Prices';
import {Currency, Wallet} from 'models/wallet';
import GlobalStore from 'storage/Global';

export const Chat = ({navigation, route}: {navigation: any; route: any}) => {
  const accountContext = useContext(AccountsStore.Context);
  const priceContext = useContext(PricesStore.Context);
  const globalContext = useContext(GlobalStore.Context);
  const chatsContext = useContext(ChatsStore.Context);

  const chatInfo = route.params.chatInfo;
  const [notificationCount, setNotificationCount] = useState(notificationCount);
  const getWallet = (currency: Currency) => {
    let account = accountContext.state.get(currency);
    let price = priceContext.state.get(currency);
    if (price == undefined) {
      price = 0;
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
      chatsContext.state.chats.get(chatInfo.address).values(),
    ).sort(function (a, b) {
      return a.timestamp < b.timestamp;
    });
  };
  const renderItem = ({item, index}: {item: Transaction; index: number}) => {
    let line;
    if (notificationCount != 0 && index == notificationCount - 1) {
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

  const flatListRef = useRef(null);
  useEffect(() => {
    navigation.setOptions({
      title:
        chatInfo.address.length <= 20
          ? `${chatInfo.address}`
          : `${chatInfo.address.substring(
              0,
              10,
            )}...${chatInfo.address.substring(
              chatInfo.address.length - 10,
              chatInfo.address.length,
            )}`,
      headerRight: () => {
        return <WalletLogo currency={chatInfo.currency} size={45} />;
      },
      headerRightContainerStyle: {
        marginRight: 20,
      },
    });

    if (chatInfo.notificationCount !== 0) {
      chatsContext.dispatch(ChatsStore.resetNotification(chatInfo.address));
      globalContext.dispatch(
        GlobalStore.removeNotificationCount(notificationCount),
      );
    }
  }, []);

  const onLayout = () => {
    if (notificationCount > 0) {
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
        onPress={() => Alert.alert('Milestone #2')}>
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
