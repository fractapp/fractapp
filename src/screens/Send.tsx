import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AmountValue } from 'components/AmountValue';
import { BlueButton } from 'components/BlueButton';
import { Receiver, ReceiverType } from 'components/Receiver';
import { EnterAddress } from 'components/EnterAddress';
import { WalletInfo } from 'components/WalletInfo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import backend from 'utils/api';
import { ChatInfo } from 'types/chatInfo';
import { Currency, getSymbol, Wallet } from 'types/wallet';
import GlobalStore from 'storage/Global';
import ChatsStore from 'storage/Chats';
import DialogStore from 'storage/Dialog';
import { checkAddress } from '@polkadot/util-crypto';
import BN from 'bn.js';
import { Adaptors } from 'adaptors/adaptor';
import { AddressOnly, Profile } from 'types/profile';
import math from 'utils/math';
import { Transaction, TxType, TxStatus } from 'types/transaction';
import StringUtils from 'utils/string';

/**
 * Screen with sending funds
 * @category Screens
 */
export const Send = ({ navigation, route }: { navigation: any; route: any }) => {
  const globalContext = useContext(GlobalStore.Context);
  const chatsContext = useContext(ChatsStore.Context);
  const dialogContext = useContext(DialogStore.Context);

  const isEditable: boolean = route.params.isEditable;
  const wallet: Wallet = route.params.wallet;

  const chatInfo: ChatInfo = route.params?.chatInfo;
  const isUSDMode: boolean = route.params?.isUSDMode ?? true;

  const value: string = route.params?.value ?? '';
  const alternativeValue: number = route.params?.alternativeValue ?? 0;
  const usdValue: number = route.params?.usdValue ?? 0;
  const usdFee: number = route.params?.usdFee ?? 0;
  const planksValueString: string = route.params?.planksValue ?? 0;
  const planksFeeString: string = route.params?.planksFee ?? 0;

  const api = Adaptors.get(wallet.network);

  const [totalUsd, setTotalUsd] = useState<number>(0);
  const [totalCurrency, setTotalCurrency] = useState<BN>(new BN(0));

  const [receiver, setReceiver] = useState<string>('');
  const [user, setUser] = useState<Profile | undefined>(undefined);

  const [isValidReceiver, setValidReceiver] = useState<boolean>(!isEditable);
  const [isWrite, setIsWrite] = useState<boolean>(false);

  useEffect(() => {
    globalContext.dispatch(GlobalStore.setLoading(true));
    (async () => {
      try {
        await api
          .init();

        if (isEditable) {
          setReceiver('');
          globalContext.dispatch(GlobalStore.setLoading(false));
          return;
        }

        const user = globalContext.state.users.get(chatInfo.id)!;
        if (!user.isAddressOnly) {
          const p = await backend.getUserById((user.value as Profile).id);

          if (p === undefined || p == null) {
            globalContext.dispatch(GlobalStore.setLoading(false));
            dialogContext.dispatch(
              DialogStore.open(
                p === undefined ? StringUtils.texts.UserHasBeenDeletedTitle : StringUtils.texts.ServiceUnavailableTitle,
                '',
                () => {
                  dialogContext.dispatch(DialogStore.close());
                },
              ),
            );
            navigation.goBack();
            return;
          } else {
            setReceiver(p.addresses.get(wallet.currency)!);
            globalContext.dispatch(GlobalStore.setUser({
              isAddressOnly: false,
              value: p,
              title: user.title,
            }));
            setUser(p);
          }

        } else {
          const r = (user.value as AddressOnly).address;
          setReceiver(r);
          setValidReceiver(
            checkAddress(r, wallet.currency === Currency.DOT ? 0 : 2)[0],
          );
        }

        setTimeout(
          () => globalContext.dispatch(GlobalStore.setLoading(false)),
          500,
        );

      } catch (e) {
        console.log('Err: ' + e);
        globalContext.dispatch(GlobalStore.setLoading(false));
        dialogContext.dispatch(
          DialogStore.open(
            StringUtils.texts.ServiceUnavailableTitle,
            '',
            () => {
              dialogContext.dispatch(DialogStore.close());
            },
          ),
        );
        navigation.goBack();
      }
    })();
  }, []);

  useEffect(() => {
    setTotalUsd(math.roundUsd(usdFee + usdValue));
    setTotalCurrency(new BN(planksValueString).add(new BN(planksFeeString)));
  }, [value, usdValue, usdFee, planksValueString, planksFeeString]);

  const send = async () => {
    if (totalCurrency.cmp(new BN(0)) <= 0) {
      return;
    }

    globalContext.dispatch(GlobalStore.setLoading(true));

    if (!isValidReceiver) {
      dialogContext.dispatch(
        DialogStore.open(StringUtils.texts.EnterValidAddressErr, '', () =>
          dialogContext.dispatch(DialogStore.close()),
        ),
      );
      globalContext.dispatch(GlobalStore.setLoading(false));
      return;
    }

    const pValue = new BN(planksValueString);
    const hash = await api.send(receiver, pValue);

    const tx: Transaction = {
      id: 'sent-' + hash,
      hash: hash,
      userId: user !== undefined ? user.id : null,
      address: receiver,
      currency: wallet.currency,
      txType: TxType.Sent,
      timestamp: Math.round(new Date().getTime()),

      value: math.convertFromPlanckToViewDecimals(
        pValue,
        api.decimals,
        api.viewDecimals,
      ),
      planckValue: pValue.toString(),
      usdValue: usdValue,

      fee: math.convertFromPlanckToViewDecimals(
        new BN(planksFeeString),
        api.decimals,
        api.viewDecimals,
      ),
      planckFee: planksFeeString,
      usdFee: usdFee,
      status: TxStatus.Pending,
    };

    chatsContext.dispatch(ChatsStore.addPendingTx(tx));

    globalContext.dispatch(GlobalStore.setLoading(false));
    navigation.reset({
      index: 1,
      actions: [
        navigation.navigate('Home'),
        navigation.navigate('Chat', {
          chatInfo: chatsContext.state.chatsInfo.get(
            tx.userId != null ? tx.userId : tx.address,
          )!,
        }),
      ],
    });
  };

  const renderReceiver = () => {
    if (isValidReceiver && !isWrite) {
      const user = globalContext.state.users.get(chatInfo.id)!;
      if (!chatInfo || user.isAddressOnly) {
        return (
          <TouchableOpacity
            style={{ width: '100%' }}
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
            nameOrAddress={user.title}
            type={ReceiverType.User}
            avatar={{
              uri: backend.getImgUrl(
                (user.value as Profile).id,
                (user.value as Profile).lastUpdate,
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
            setValidReceiver(result[0]);
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

      <View style={{ width: '100%', marginTop: 40, alignItems: 'center' }}>
        <AmountValue
          value={value}
          currency={wallet.currency}
          width={'95%'}
          onPress={() =>
            !isValidReceiver
              ? dialogContext.dispatch(
              DialogStore.open(
                StringUtils.texts.EnterValidAddressErr,
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
      <View style={{ width: '85%', marginTop: 60 }}>
        <BlueButton
          text={
            StringUtils.texts.SendBtn +
            (totalUsd > 0
              ? ` $${totalUsd} (${math.convertFromPlanckToViewDecimals(
                totalCurrency,
                api.decimals,
                api.viewDecimals,
              )} ${getSymbol(wallet.currency)})`
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
