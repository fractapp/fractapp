import React, {useEffect, useState} from 'react';
import { StyleSheet, View, Text, Keyboard } from 'react-native';
import {AmountInput} from 'components/AmountInput';
import {SuccessButton} from 'components/SuccessButton';
import { Currency, getSymbol } from 'types/wallet';
import Dialog from 'storage/Dialog';
import StringUtils from 'utils/string';
import { useDispatch, useSelector } from 'react-redux';
import ServerInfoStore from 'storage/ServerInfo';
import MathUtils from 'utils/math';
import AccountsStore from 'storage/Accounts';
import {EnterAmountInfo} from 'types/inputs';

/**
 * Screen with the input of the amount to be sent
 * @category Screens
 */
export const EnterAmount = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const currency: Currency = route.params.currency;
  const receiver: string = route.params.receiver;
  const defaultValue = route.params?.value ?? '';

  const [isUSDMode, setUSDMode] = useState<boolean>(
    route.params?.isUSDMode ?? true,
  );
  const [value, setValue] = useState<string>('0');
  const [usdValue, setUsdValue] = useState<number>(0);
  const [alternativeValue, setAlternativeValue] = useState<number>(0);
  const [usdFee, setUsdFee] = useState<number>(0);
  const [planksValue, setPlanksValue] = useState<string>('');
  const [planksFee, setPlanksFee] = useState<string>('');
  const [isValid, setValid] = useState<boolean>(true);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const dispatch = useDispatch();
  const serverInfo: ServerInfoStore.State = useSelector((state: any) => state.serverInfo);
  const accountState: AccountsStore.State = useSelector((state: any) => state.accounts);

  const account = accountState.accounts[currency];
  const price = serverInfo.prices[account.currency] ?? 0;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const onSuccess = async () => {
    if (isLoading) {
      dispatch(
        Dialog.actions.showDialog({
            title: StringUtils.texts.WaitLoadingTitle,
            text: '',
          },
        ),
      );
      return;
    }

    navigation.navigate('Send', {
      isUSDMode: isUSDMode,
      value: value,
      usdValue: usdValue,
      alternativeValue: alternativeValue,
      usdFee: usdFee,
      planksValue: planksValue,
      planksFee: planksFee,
    });
  };

  const onChangeValues = (
    enterAmountInfo: EnterAmountInfo
  ) => {
    setValue(enterAmountInfo.value);
    setUsdValue(enterAmountInfo.usdValue);
    setAlternativeValue(enterAmountInfo.alternativeValue);
    setPlanksValue(enterAmountInfo.planksValue);
    setPlanksFee(enterAmountInfo.planksFee);
    setUsdFee(enterAmountInfo.usdFee);
    setUSDMode(enterAmountInfo.isUSDMode);
    setValid(enterAmountInfo.isValid);
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <SuccessButton size={35} onPress={onSuccess} />;
      },
    });
  }, [isLoading]);

  return (
    <View style={styles.chats}>
      <AmountInput
        width={'95%'}
        account={account}
        receiver={receiver}
        price={price}
        onChangeValues={onChangeValues}
        onSetLoading={(loading: boolean) => setLoading(loading)}
        defaultValue={defaultValue}
        defaultUsdMode={isUSDMode}
      />
      <View
        style={[
          styles.balance,
          isKeyboardVisible
            ? {
                bottom: 350,
              }
            : {
                bottom: 60,
              },
          !isValid && !isLoading
            ? {
                borderColor: '#EA4335',
              }
            : {
                borderColor: '#2AB2E2',
              },
        ]}>
        <View style={{width: '30%', alignItems: 'flex-start'}}>
          <Text style={styles.balanceText}>
            {StringUtils.texts.YourBalanceTitle}
          </Text>
        </View>
        <View style={{width: '70%', alignItems: 'flex-end'}}>
          <Text style={styles.balanceText}>{`$${MathUtils.roundUsd(account.balance * price)} (${
            account.balance
          } ${getSymbol(account.currency)})`}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chats: {
    marginTop: 15,
    alignItems: 'center',
    flex: 1,
  },
  balance: {
    padding: 12,
    position: 'absolute',
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '90%',
  },
  balanceText: {
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'black',
  },
});
