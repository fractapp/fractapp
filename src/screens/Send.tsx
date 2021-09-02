import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AmountValue } from 'components/AmountValue';
import { BlueButton } from 'components/BlueButton';
import { Receiver, ReceiverType } from 'components/Receiver';
import { EnterAddress } from 'components/EnterAddress';
import { WalletInfo } from 'components/WalletInfo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import backend from 'utils/api';
import { ChatInfo } from 'types/chatInfo';
import { Currency, getSymbol } from 'types/wallet';
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
import { useDispatch, useSelector } from 'react-redux';
import UsersStore from 'storage/Users';
import AccountsStore from 'storage/Accounts';
import ServerInfoStore from 'storage/ServerInfo';

/**
 * Screen with sending funds
 * @category Screens
 */
export const Send = ({ navigation, route }: { navigation: any; route: any }) => {
  const dispatch = useDispatch();
  const accountState: AccountsStore.State = useSelector((state: any) => state.accounts);
  const serverInfoState: ServerInfoStore.State = useSelector((state: any) => state.serverInfo);
  const chatsState: ChatsStore.State = useSelector((state: any) => state.chats);
  const usersState: UsersStore.State = useSelector((state: any) => state.users);
  const globalState: GlobalStore.State = useSelector((state: any) => state.global);

  const isEditable: boolean = route.params.isEditable;
  const currency: Currency = route.params.currency;

  const chatId: string | undefined = route.params?.chatId;
  const chatInfo: ChatInfo | undefined = chatId === undefined ? undefined : chatsState.chatsInfo[chatId];
  const isUSDMode: boolean = route.params?.isUSDMode ?? true;

  const value: string = route.params?.value ?? '';
  const alternativeValue: number = route.params?.alternativeValue ?? 0;
  const usdValue: number = route.params?.usdValue ?? 0;
  const usdFee: number = route.params?.usdFee ?? 0;
  const planksValueString: string = route.params?.planksValue ?? 0;
  const planksFeeString: string = route.params?.planksFee ?? 0;

  const account = accountState.accounts[currency];
  const api = Adaptors.get(account.network)!;

  const [totalUsd, setTotalUsd] = useState<number>(0);
  const [totalCurrency, setTotalCurrency] = useState<BN>(new BN(0));

  const [receiver, setReceiver] = useState<string>('');
  const [user, setUser] = useState<Profile | undefined>(undefined);

  const [isValidReceiver, setValidReceiver] = useState<boolean>(!isEditable);
  const [isWrite, setWrite] = useState<boolean>(false);

  useEffect(() => {
    dispatch(GlobalStore.actions.showLoading());
    (async () => {
      try {
        if (isEditable || chatInfo === undefined) {
          setReceiver('');
          dispatch(GlobalStore.actions.hideLoading());
          return;
        }

        const user = usersState.users[chatInfo.id]!;
        if (!user.isAddressOnly) {
          const p = await backend.getUserById((user.value as Profile).id);

          if (p === undefined || p == null || p.addresses == null) {
            dispatch(GlobalStore.actions.hideLoading());
            dispatch(
              DialogStore.actions.showDialog(
                {
                  title: p === undefined ? StringUtils.texts.UserHasBeenDeletedTitle : StringUtils.texts.ServiceUnavailableTitle,
                  text: '',
                }
              ),
            );
            navigation.goBack();
            return;
          } else {
            setReceiver(p.addresses[account.currency]!);
            dispatch(UsersStore.actions.setUsers([{
              isAddressOnly: false,
              value: p,
              title: user.title,
            }]));
            setUser(p);
          }
        } else {
          const r = (user.value as AddressOnly).address;
          setReceiver(r);
          setValidReceiver(
            checkAddress(r, account.currency === Currency.DOT ? 0 : 2)[0],
          );
        }

        setTimeout(
          () => dispatch(GlobalStore.actions.hideLoading()),
          500,
        );
      } catch (e) {
        console.log('Err: ' + e);
        dispatch(GlobalStore.actions.hideLoading());
        dispatch(
          DialogStore.actions.showDialog({
              title: StringUtils.texts.ServiceUnavailableTitle,
              text: '',
            }
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

    dispatch(GlobalStore.actions.showLoading());

    if (!isValidReceiver) {
      dispatch(
        DialogStore.actions.showDialog({
            title: StringUtils.texts.EnterValidAddressErr,
            text: '',
          },
        ),
      );
      dispatch(GlobalStore.actions.hideLoading());
      return;
    }

    const pValue = new BN(planksValueString);
    try {
      const hash = await api.send(receiver, pValue, pValue.add(new BN(planksFeeString)).cmp(new BN(account.planks)) === 0);

      const tx: Transaction = {
        id: 'sent-' + hash,
        hash: hash,
        userId: user !== undefined ? user.id : null,
        address: receiver,
        currency: account.currency,
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

      dispatch(ChatsStore.actions.addPendingTx({
        tx: tx,
        owner: globalState.profile.id,
      }));

      dispatch(GlobalStore.actions.hideLoading());
      try {
        navigation.reset({
          index: 1,
          actions: [
            navigation.navigate('Home'),
            navigation.navigate('Chat', {
              chatInfo: chatsState.chatsInfo[tx.userId != null ? tx.userId : tx.address]!,
            }),
          ],
        });
      } catch (e) {
      }
    } catch (e) {
      dispatch(GlobalStore.actions.hideLoading());
      console.log('e: ' + e);
      dispatch(
        DialogStore.actions.showDialog({
          title: StringUtils.texts.ServiceUnavailableTitle,
          text: '',
        }),
      );
    }
  };

  const renderReceiver = () => {
    if (isValidReceiver && !isWrite) {
      const user = chatInfo === undefined ? undefined : usersState.users[chatInfo.id];
      if (!user || user.isAddressOnly) {
        return (
          <TouchableOpacity
            style={{ width: '100%' }}
            onPress={isEditable ? () => setWrite(true) : () => true}>
            <Receiver
              currency={account.currency}
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
              account.currency === Currency.DOT ? 0 : 2,
            );
            setValidReceiver(result[0]);
          }}
          onOk={() => setWrite(false)}
          currency={account.currency}
        />
      );
    }
  };

  return (
    <View style={styles.chats}>
      <WalletInfo account={account} price={serverInfoState.prices[account.currency]} />
      <MaterialIcons name={'keyboard-arrow-down'} size={25} />

      {renderReceiver()}

      <View style={{ width: '100%', marginTop: 40, alignItems: 'center' }}>
        <AmountValue
          value={value}
          currency={account.currency}
          width={'95%'}
          onPress={() =>
            !isValidReceiver
              ? dispatch(
              DialogStore.actions.showDialog({
                title: StringUtils.texts.EnterValidAddressErr,
                text: '',
              }))
              : navigation.navigate('EnterAmount', {
                  isUSDMode: isUSDMode,
                  value: value,
                  currency: account.currency,
                  args: [receiver],
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
              )} ${getSymbol(account.currency)})`
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
