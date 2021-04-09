import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {AmountValue} from 'components/AmountValue';
import {BlueButton} from 'components/BlueButton';
import {Receiver, ReceiverType} from 'components/Receiver';
import {EnterAddress} from 'components/EnterAddress';
import {WalletInfo} from 'components/WalletInfo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MathUtils from 'utils/math';
import backend from 'utils/backend';
import tasks from 'utils/tasks';
import {ChatInfo, ChatType} from 'types/chatInfo';
import {Transaction, TxStatus, TxType} from 'types/transaction';
import {Currency, getSymbol, Wallet} from 'types/wallet';
import TransactionsStore from 'storage/Transactions';
import GlobalStore from 'storage/Global';
import ChatsStore from 'storage/Chats';
import PricesStore from 'storage/Prices';
import DialogStore from 'storage/Dialog';
import {checkAddress} from '@polkadot/util-crypto';
import BN from 'bn.js';
import {Adaptors} from 'adaptors/adaptor';
import math from 'utils/math';
import Dialog from 'storage/Dialog';

/**
 * Screen with sending funds
 * @category Screens
 */
export const Send = ({navigation, route}: {navigation: any; route: any}) => {
  const globalContext = useContext(GlobalStore.Context);
  const priceContext = useContext(PricesStore.Context);
  const transactionContext = useContext(TransactionsStore.Context);
  const chatsContext = useContext(ChatsStore.Context);
  const dialogContext = useContext(DialogStore.Context);

  const isEditable: boolean = route.params.isEditable;
  const wallet: Wallet = route.params.wallet;

  const chatInfo: ChatInfo = route.params?.chatInfo;
  const isUSDMode: boolean = route.params?.isUSDMode ?? true;

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
    const api = Adaptors.get(wallet.network);
    api
      .init()
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
              DialogStore.open('Service unavailable', '', () => {
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
      .catch((e: Error) => {
        console.log('Err: ' + e);
        globalContext.dispatch(GlobalStore.setLoading(false));
        dialogContext.dispatch(
          DialogStore.open('Service unavailable', '', () => {
            dialogContext.dispatch(DialogStore.close());
          }),
        );
        navigation.goBack();
      });
  }, []);
  useEffect(() => {
    if (value <= 0 || receiver === '' || !isValidReceiver) {
      return;
    }

    (async () => {
      const api = Adaptors.get(wallet.network);
      const aValue = await MathUtils.calculateAlternativeValue(
        priceContext.state.get(wallet.currency) ?? 0,
        api.viewDecimals,
        value,
        isUSDMode,
      );
      const currencyValue = isUSDMode ? aValue : value;
      const usdValue = isUSDMode ? value : aValue;

      if (currencyValue <= 0) {
        setUsdFee(0);
        return;
      }

      const fee = await api.calculateFee(currencyValue, receiver);
      const usdFee = await MathUtils.calculateAlternativeValue(
        priceContext.state.get(wallet.currency) ?? 0,
        api.viewDecimals,
        math.convertFromPlanckToViewDecimals(
          fee,
          api.decimals,
          api.viewDecimals,
        ),
        false,
      );

      setAlternativeValue(aValue);
      setPlanksFee(fee);
      setUsdFee(usdFee);

      setTotalUsd(usdFee + usdValue);
      setTotalCurrency(
        currencyValue +
          math.convertFromPlanckToViewDecimals(
            fee,
            api.decimals,
            api.viewDecimals,
          ), //TODO
      );
    })();
  }, [value, isUSDMode, receiver]);

  const send = async () => {
    globalContext.dispatch(GlobalStore.setLoading(true));

    if (!isValidReceiver) {
      dialogContext.dispatch(
        DialogStore.open('Please enter a valid address first', '', () =>
          dialogContext.dispatch(DialogStore.close()),
        ),
      );
      globalContext.dispatch(GlobalStore.setLoading(false));
      return;
    }

    const api = Adaptors.get(wallet.network);
    const currencyValue = isUSDMode ? alternativeValue : value;
    const planksValue = math.convertToPlanck(
      String(currencyValue),
      api.decimals,
    );

    const transferValidation = await api.isValidTransfer(
      wallet.address,
      receiver,
      planksValue,
      planksFee,
    );

    if (!transferValidation.isOk) {
      dialogContext.dispatch(
        Dialog.open(
          transferValidation.errorTitle,
          transferValidation.errorMsg,
          () => dialogContext.dispatch(Dialog.close()),
        ),
      );
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

      value: math.convertFromPlanckToViewDecimals(
        v,
        api.decimals,
        api.viewDecimals,
      ),
      planckValue: v.toString(),
      usdValue: usdValue,

      fee: math.convertFromPlanckToViewDecimals(
        planksFee,
        api.decimals,
        api.viewDecimals,
      ),
      planckFee: planksFee.toString(),
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
            avatar={{
              uri: backend.getImgUrl(
                globalContext.state.users.get(chatInfo.id)!.id,
                globalContext.state.users.get(chatInfo.id)!.lastUpdate,
              ),
            }}
          />
        );
      }
    } else {
      return (
        <EnterAddress
          isValid={isValidReceiver}
          value={receiver}
          onChangeText={(text) => {
            setReceiver(text);
            const result = checkAddress(
              text,
              wallet.currency === Currency.DOT ? 0 : 2,
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
                  DialogStore.open(
                    'Please enter a valid address first',
                    '',
                    () => dialogContext.dispatch(DialogStore.close()),
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
