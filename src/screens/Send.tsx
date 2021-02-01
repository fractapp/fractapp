import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Wallet} from 'models/wallet';
import {AmountValue, BlueButton, Receiver, WalletInfo} from 'components/index';
import {ReceiverType} from 'components/Receiver';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Api} from 'utils/polkadot';
import MathUtils from 'utils/math';
import PricesStore from 'storage/Prices';
import {ChatInfo, ChatType, DefaultDetails, UserDetails} from 'models/chatInfo';
import backend from 'utils/backend';
import {Transaction, TxStatus, TxType} from 'models/transaction';
import TransactionsStore from 'storage/Transactions';
import tasks from 'utils/tasks';
import GlobalStore from 'storage/Global';
import ChatsStore from 'storage/Chats';

export const Send = ({navigation, route}: {navigation: any; route: any}) => {
  const globalContext = useContext(GlobalStore.Context);
  const priceContext = useContext(PricesStore.Context);
  const transactionContext = useContext(TransactionsStore.Context);
  const chatsContext = useContext(ChatsStore.Context);

  const [usdFee, setUsdFee] = useState<number>(0);

  const [alternativeValue, setAlternativeValue] = useState<number>(0);

  const wallet: Wallet = route.params.wallet;
  const chatInfo: ChatInfo = route.params.chatInfo;

  const receiver: string =
    chatInfo.type === ChatType.AddressOnly
      ? (chatInfo.details as DefaultDetails).address
      : (chatInfo.details as UserDetails).addresses.get(wallet.currency)!;

  const isUSDMode: boolean = route.params?.isUSDMode ?? true;
  const value: number = route.params?.value ?? 0;

  const send = async () => {
    const api = await Api.getInstance(wallet.currency);
    const currencyValue = isUSDMode ? alternativeValue : value;
    const usdValue = isUSDMode ? value : alternativeValue;

    const planksValue = api.convertToPlanck(String(currencyValue));

    const info = await api
      .getSubstrateApi()
      .tx.balances.transferKeepAlive(
        receiver,
        api.convertToPlanck(String(currencyValue)),
      )
      .paymentInfo(wallet.address);

    const id = await api.send(receiver, planksValue.add(info.partialFee));

    const tx = new Transaction(
      id,
      receiver,
      wallet.currency,
      TxType.Sent,
      Math.round(new Date().getTime()),
      MathUtils.floor(currencyValue, api.viewDecimals),
      usdValue,
      MathUtils.floor(
        api.convertFromPlanckWithViewDecimals(info.partialFee),
        api.viewDecimals,
      ),
      usdFee,
      TxStatus.Pending,
    );
    transactionContext.dispatch(
      TransactionsStore.addPendingTx(wallet.currency, tx.id),
    );

    const chatInfo = await tasks.setTx(
      globalContext,
      chatsContext,
      transactionContext,
      tx,
      false,
    );

    navigation.reset({
      index: 1,
      actions: [
        navigation.navigate('Home'),
        navigation.navigate('Chat', {chatInfo: chatInfo}),
      ],
    });
  };

  useEffect(() => {
    if (value <= 0) {
      return;
    }

    const price = priceContext.state?.get(wallet.currency) ?? 0;
    Api.getInstance(wallet.currency).then(async (api) => {
      let alternativeValue: number;

      if (isUSDMode) {
        alternativeValue = MathUtils.round(value / price, api.viewDecimals);
      } else {
        alternativeValue = MathUtils.roundUsd(value * price);
      }

      setAlternativeValue(alternativeValue);

      const currencyValue = isUSDMode ? alternativeValue : value;

      const info = await api
        .getSubstrateApi()
        .tx.balances.transferKeepAlive(
          receiver,
          api.convertToPlanck(String(currencyValue)),
        )
        .paymentInfo(wallet.address);

      if (currencyValue <= 0) {
        setUsdFee(0);
        return;
      }

      setUsdFee(
        MathUtils.roundUsd(
          api.convertFromPlanckWithViewDecimals(info.partialFee) * price,
        ),
      );
    });
  }, [value, isUSDMode]);

  return (
    <View style={styles.chats}>
      <WalletInfo wallet={wallet} />
      <MaterialIcons name={'keyboard-arrow-down'} size={25} />
      {chatInfo.type === ChatType.AddressOnly ? (
        <Receiver
          currency={wallet.currency}
          nameOrAddress={receiver}
          type={ReceiverType.Address}
        />
      ) : (
        <Receiver
          nameOrAddress={chatInfo.name}
          type={ReceiverType.User}
          avatar={
            (chatInfo.details as UserDetails).avatarExt === ''
              ? require('assets/img/default-avatar.png')
              : {
                  uri: backend.getImgUrl(
                    (chatInfo.details as UserDetails).id,
                    (chatInfo.details as UserDetails).avatarExt,
                    (chatInfo.details as UserDetails).lastUpdate,
                  ),
                }
          }
        />
      )}

      <View style={{width: '100%', marginTop: 40, alignItems: 'center'}}>
        <AmountValue
          value={value}
          currency={wallet.currency}
          width={'95%'}
          onPress={() =>
            navigation.navigate('EnterAmount', {
              isUSDMode: isUSDMode,
              value: value,
              wallet: wallet,
              callerScreen: 'Send',
              receiver: receiver,
            })
          }
          alternativeValue={alternativeValue}
          fee={usdFee}
          isUSDMode={isUSDMode}
        />
      </View>
      <View style={{width: '85%', marginTop: 60}}>
        <BlueButton text={'Send'} height={55} onPress={() => send()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chats: {
    marginTop: 10,
    alignItems: 'center',
    flex: 1,
  },
  list: {
    flex: 1,
    width: '100%',
  },
  dividingLine: {
    marginLeft: 80,
    width: '100%',
    height: 1,
    backgroundColor: '#ededed',
  },
});
