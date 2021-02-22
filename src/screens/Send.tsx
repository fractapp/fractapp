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
import {ChatInfo, ChatType} from 'models/chatInfo';
import backend from 'utils/backend';
import {Transaction, TxStatus, TxType} from 'models/transaction';
import TransactionsStore from 'storage/Transactions';
import tasks from 'utils/tasks';
import GlobalStore from 'storage/Global';
import ChatsStore from 'storage/Chats';
import BN from 'bn.js';
import Dialog from 'storage/Dialog';
import DialogStore from 'storage/Dialog';
import {checkAddress} from '@polkadot/util-crypto';

export const Send = ({navigation, route}: {navigation: any; route: any}) => {
  const globalContext = useContext(GlobalStore.Context);
  const priceContext = useContext(PricesStore.Context);
  const transactionContext = useContext(TransactionsStore.Context);
  const chatsContext = useContext(ChatsStore.Context);
  const dialogContext = useContext(DialogStore.Context);

  const isEditable: boolean = route.params.isEditable;
  const isUSDMode: boolean = route.params?.isUSDMode ?? true;

  const wallet: Wallet = route.params.wallet;
  const chatInfo: ChatInfo = route.params?.chatInfo;

  const value: number = route.params?.value ?? 0;
  const [usdFee, setUsdFee] = useState<number>(0);
  const [planksFee, setPlanksFee] = useState<BN>(new BN(0));
  const [alternativeValue, setAlternativeValue] = useState<number>(0);

  const [totalUsd, setTotalUsd] = useState<number>(0);
  const [totalCurrency, setTotalCurrency] = useState<number>(0);

  const [receiver, setReceiver] = useState<string>('');

  const [isValidReceiver, setIsValidReceiver] = useState<boolean>(!isEditable);
  const [isWrite, setIsWrite] = useState<boolean>(false);

  useEffect(() => {
    globalContext.dispatch(GlobalStore.setLoading(true));
    Api.getInstance(wallet.currency).then((api) =>
      api
        .getSubstrateApi()
        .then(async () => {
          if (isEditable) {
            setReceiver('');
            globalContext.dispatch(GlobalStore.setLoading(false));
            return;
          }

          if (chatInfo.type === ChatType.Chat) {
            const details = globalContext.state.users.get(chatInfo.id)!;
            const p = await backend.getUserById(details.id);
            if (p == null) {
              globalContext.dispatch(GlobalStore.setLoading(false));
              dialogContext.dispatch(
                Dialog.open('Service unavailable', '', () => {
                  dialogContext.dispatch(DialogStore.close());
                }),
              );
              navigation.goBack();
              return;
            } else {
              setReceiver(p.addresses[wallet.currency]);
              globalContext.dispatch(GlobalStore.setUser(p));
            }
          } else if (chatInfo.type === ChatType.AddressOnly) {
            setReceiver(chatInfo.details!.address);
          }

          setTimeout(
            () => globalContext.dispatch(GlobalStore.setLoading(false)),
            500,
          );
        })
        .catch((e) => {
          console.log('Err: ' + e);
          globalContext.dispatch(GlobalStore.setLoading(false));
          dialogContext.dispatch(
            Dialog.open('Service unavailable', '', () => {
              dialogContext.dispatch(DialogStore.close());
            }),
          );
          navigation.goBack();
        }),
    );
  }, []);
  useEffect(() => {
    if (value <= 0 || receiver === '' || !isValidReceiver) {
      return;
    }

    MathUtils.calculateValue(
      priceContext,
      wallet.currency,
      value,
      isUSDMode,
    ).then(async (aValue) => {
      const api = await Api.getInstance(wallet.currency);
      const currencyValue = isUSDMode ? aValue : value;
      const usdValue = isUSDMode ? value : aValue;

      if (currencyValue <= 0) {
        setUsdFee(0);
        return;
      }

      const info = await MathUtils.calculateTxInfo(
        priceContext,
        wallet.currency,
        currencyValue,
        receiver,
      );

      setAlternativeValue(aValue);
      setPlanksFee(info.fee);
      setUsdFee(info.usdFee);

      setTotalUsd(info.usdFee + usdValue);
      setTotalCurrency(
        currencyValue + api.convertFromPlanckWithViewDecimals(info.fee),
      );
    });
  }, [value, isUSDMode, receiver]);

  const send = async () => {
    globalContext.dispatch(GlobalStore.setLoading(true));

    if (!isValidReceiver) {
      dialogContext.dispatch(
        Dialog.open('Please enter a valid address first', '', () =>
          dialogContext.dispatch(Dialog.close()),
        ),
      );
      globalContext.dispatch(GlobalStore.setLoading(false));
      return;
    }

    const api = await Api.getInstance(wallet.currency);
    const currencyValue = isUSDMode ? alternativeValue : value;
    const substrateApi = await api.getSubstrateApi();

    const info = await substrateApi.tx.balances
      .transferKeepAlive(receiver, api.convertToPlanck(String(currencyValue)))
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
      globalContext.dispatch(GlobalStore.setLoading(false));
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
      globalContext.dispatch(GlobalStore.setLoading(false));
      return;
    }

    const v = planksValue.add(planksFee);
    const id = await api.send(receiver, v);
    const usdValue = isUSDMode ? value : alternativeValue;

    const tx: Transaction = {
      id: id,
      userId: null,
      address: receiver,
      currency: wallet.currency,
      txType: TxType.Sent,
      timestamp: Math.round(new Date().getTime()),
      value: MathUtils.floor(
        api.convertFromPlanckWithViewDecimals(v),
        api.viewDecimals,
      ),
      usdValue: usdValue,
      fee: MathUtils.floor(
        api.convertFromPlanckWithViewDecimals(planksFee),
        api.viewDecimals,
      ),
      usdFee: usdFee,
      status: TxStatus.Pending,
    };

    transactionContext.dispatch(
      TransactionsStore.addPendingTx(wallet.currency, tx.id),
    );

    const cInfo = await tasks.setTx(
      globalContext,
      chatsContext,
      transactionContext,
      tx,
      false,
    );

    globalContext.dispatch(GlobalStore.setLoading(false));

    navigation.reset({
      index: 1,
      actions: [
        navigation.navigate('Home'),
        navigation.navigate('Chat', {chatInfo: cInfo}),
      ],
    });
  };

  const renderReceiver = () => {
    if (isValidReceiver && !isWrite) {
      if (!chatInfo || chatInfo.type === ChatType.AddressOnly) {
        return (
          <TouchableOpacity
            style={{width: '100%'}}
            onPress={isEditable ? () => setIsWrite(true) : () => true}>
            <Receiver
              currency={wallet.currency}
              nameOrAddress={receiver}
              type={ReceiverType.Address}
            />
          </TouchableOpacity>
        );
      } else {
        return (
          <Receiver
            nameOrAddress={chatInfo.name}
            type={ReceiverType.User}
            avatar={
              globalContext.state.users.get(chatInfo.id)!.avatarExt === ''
                ? require('assets/img/default-avatar.png')
                : {
                    uri: backend.getImgUrl(
                      globalContext.state.users.get(chatInfo.id)!.id,
                      globalContext.state.users.get(chatInfo.id)!.avatarExt,
                      globalContext.state.users.get(chatInfo.id)!.lastUpdate,
                    ),
                  }
            }
          />
        );
      }
    } else {
      return (
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
      );
    }
  };

  return (
    <View style={styles.chats}>
      <WalletInfo wallet={wallet} />
      <MaterialIcons name={'keyboard-arrow-down'} size={25} />
      {renderReceiver()}

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
                  receiver: receiver,
                })
          }
          alternativeValue={alternativeValue}
          fee={usdFee}
          isUSDMode={isUSDMode}
        />
      </View>
      <View style={{width: '85%', marginTop: 60}}>
        <BlueButton
          text={
            'Send' +
            (totalUsd > 0
              ? ` $${totalUsd} (${totalCurrency} ${getSymbol(wallet.currency)})`
              : '')
          }
          height={55}
          onPress={() => send()}
        />
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
