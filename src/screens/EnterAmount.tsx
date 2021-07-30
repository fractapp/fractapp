import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Text, Keyboard} from 'react-native';
import {AmountInput} from 'components/AmountInput';
import {SuccessButton} from 'components/SuccessButton';
import {getSymbol, Wallet} from 'types/wallet';
import BN from 'bn.js';
import Dialog from 'storage/Dialog';
import StringUtils from 'utils/string';
import { useDispatch } from 'react-redux';

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
  const dispatch = useDispatch();

  const defaultValue = route.params?.value ?? '';

  const wallet: Wallet = route.params.wallet;
  const receiver: string = route.params.receiver;

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
            onPress: () => dispatch(Dialog.actions.hideDialog()),
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
    value: string,
    usdValue: number,
    alternativeValue: number,
    planksValue: BN,
    planksFee: BN,
    usdFee: number,
    usdMode: boolean,
    isValid: boolean,
  ) => {
    setValue(value);
    setUsdValue(usdValue);
    setAlternativeValue(alternativeValue);
    setPlanksValue(planksValue.toString());
    setPlanksFee(planksFee.toString());
    setUsdFee(usdFee);
    setUSDMode(usdMode);
    setValid(isValid);
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <SuccessButton size={35} onPress={onSuccess} />;
      },
    });
  }, [value, alternativeValue, usdFee, isUSDMode]);
  return (
    <View style={styles.chats}>
      <AmountInput
        width={'95%'}
        wallet={wallet}
        receiver={receiver}
        usdMode={isUSDMode}
        onChangeValues={onChangeValues}
        onSetLoading={(isLoading: boolean) => setLoading(isLoading)}
        defaultValue={defaultValue}
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
          isValid
            ? {
                borderColor: '#2AB2E2',
              }
            : {
                borderColor: '#EA4335',
              },
        ]}>
        <View style={{width: '30%', alignItems: 'flex-start'}}>
          <Text style={styles.balanceText}>
            {StringUtils.texts.YourBalanceTitle}
          </Text>
        </View>
        <View style={{width: '70%', alignItems: 'flex-end'}}>
          <Text style={styles.balanceText}>{`$${wallet.usdValue} (${
            wallet.balance
          } ${getSymbol(wallet.currency)})`}</Text>
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
