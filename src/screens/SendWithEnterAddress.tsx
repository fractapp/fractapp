import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Currency, getSymbol, Wallet} from 'models/wallet';
import {
  AmountValue,
  BlueButton,
  Receiver,
  ReceiverWithEnterAddress,
  WalletInfo,
} from 'components/index';
import {ReceiverType} from 'components/Receiver';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Api} from 'utils/polkadot';
import MathUtils from 'utils/math';
import PricesStore from 'storage/Prices';
import {checkAddress} from '@polkadot/util-crypto';
import DialogStore from 'storage/Dialog';
import Dialog from 'storage/Dialog';
import BN from 'bn.js';
import TransactionsStore from 'storage/Transactions';
import {Transaction, TxStatus, TxType} from 'models/transaction';
import ChatsStore from 'storage/Chats';
import {ChatInfo, ChatType} from 'models/chatInfo';
import tasks from 'utils/tasks';
import GlobalStore from 'storage/Global';

export const SendWithEnterAddress = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const globalContext = useContext(GlobalStore.Context);
  const priceContext = useContext(PricesStore.Context);
  const dialogContext = useContext(DialogStore.Context);
  const transactionContext = useContext(TransactionsStore.Context);
  const chatsContext = useContext(ChatsStore.Context);

  const [usdFee, setUsdFee] = useState<number>(0);
  const [planksFee, setPlanksFee] = useState<BN>(new BN(0));
  const [receiver, setReceiver] = useState<string>('');
  const [isValidReceiver, setIsValidReceiver] = useState<boolean>(false);
  const [isWrite, setIsWrite] = useState<boolean>(false);

  const [alternativeValue, setAlternativeValue] = useState<number>(0);

  const wallet: Wallet = route.params.wallet;
  const isUSDMode: boolean = route.params?.isUSDMode ?? true;
  const value: number = route.params?.value ?? 0;

  const send = async () => {
    if (!isValidReceiver) {
      dialogContext.dispatch(
        Dialog.open('Please enter a valid address first', '', () =>
          dialogContext.dispatch(Dialog.close()),
        ),
      );
      return;
    }

    const api = await Api.getInstance(wallet.currency);
    const currencyValue = isUSDMode ? alternativeValue : value;

    const info = await api
      .getSubstrateApi()
      .tx.balances.transferKeepAlive(
        receiver,
        api.convertToPlanck(String(currencyValue)),
      )
      .paymentInfo(wallet.address);

    const planksValue = api.convertToPlanck(String(currencyValue));

    if (
      (await api.balance(receiver))![1]
        .add(planksValue)
        .cmp(await api.minTransfer()) < 0
    ) {
      dialogContext.dispatch(
        Dialog.open(
          'Minimum transfer',
          `The minimum transfer for this recipient is ${api.convertFromPlanckWithViewDecimals(
            await api.minTransfer(),
          )} ${getSymbol(wallet.currency)}`,
          () => dialogContext.dispatch(Dialog.close()),
        ),
      );
      return;
    }

    const balanceAfterBalance = new BN(wallet.planks)
      .sub(planksValue)
      .sub(info.partialFee);

    if (
      balanceAfterBalance.cmp(await api.minTransfer()) < 0 &&
      balanceAfterBalance.cmp(new BN(0)) !== 0
    ) {
      dialogContext.dispatch(
        Dialog.open(
          'Balance',
          `After the transfer, more than ${api.convertFromPlanckWithViewDecimals(
            await api.minTransfer(),
          )} ${getSymbol(
            wallet.currency,
          )} should remain on the balance or transfer the entire remaining balance. Valid amount without fee: ${api.convertFromPlanckString(
            new BN(wallet.planks).sub(info.partialFee),
          )}`,
          () => dialogContext.dispatch(Dialog.close()),
        ),
      );
      return;
    }

    const id = await api.send(receiver, planksValue.add(planksFee));
    const usdValue = isUSDMode ? value : alternativeValue;

    const tx = new Transaction(
      id,
      receiver,
      wallet.currency,
      TxType.Sent,
      Math.round(new Date().getTime()),
      MathUtils.floor(currencyValue, api.viewDecimals),
      usdValue,
      MathUtils.floor(
        api.convertFromPlanckWithViewDecimals(planksFee),
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
    if (value <= 0 || receiver === '' || !isValidReceiver) {
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

      setPlanksFee(info.partialFee);
      setUsdFee(
        MathUtils.roundUsd(
          api.convertFromPlanckWithViewDecimals(info.partialFee) * price,
        ),
      );
    });
  }, [value, isUSDMode, receiver]);

  return (
    <View style={styles.chats}>
      <WalletInfo wallet={wallet} />
      <MaterialIcons name={'keyboard-arrow-down'} size={25} />
      {isValidReceiver && !isWrite ? (
        <TouchableOpacity
          style={{width: '100%'}}
          onPress={() => setIsWrite(true)}>
          <Receiver
            currency={wallet.currency}
            nameOrAddress={receiver}
            type={ReceiverType.Address}
          />
        </TouchableOpacity>
      ) : (
        <ReceiverWithEnterAddress
          isValid={isValidReceiver}
          value={receiver}
          onChangeText={(text) => {
            setReceiver(text);
            const result = checkAddress(
              text,
              wallet.currency === Currency.Polkadot ? 0 : 2,
            );
            setIsValidReceiver(result[0]);
          }}
          onOk={() => setIsWrite(false)}
          currency={wallet.currency}
        />
      )}

      <View style={{width: '100%', marginTop: 40, alignItems: 'center'}}>
        <AmountValue
          value={value}
          currency={wallet.currency}
          width={'95%'}
          onPress={() =>
            !isValidReceiver
              ? dialogContext.dispatch(
                  Dialog.open('Please enter a valid address first', '', () =>
                    dialogContext.dispatch(Dialog.close()),
                  ),
                )
              : navigation.navigate('EnterAmount', {
                  isUSDMode: isUSDMode,
                  value: value,
                  wallet: wallet,
                  callerScreen: 'SendWithEnterAddress',
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
