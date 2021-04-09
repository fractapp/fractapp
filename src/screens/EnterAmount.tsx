import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {AmountInput} from 'components/AmountInput';
import {SuccessButton} from 'components/SuccessButton';
import {Wallet} from 'types/wallet';
import PricesStore from 'storage/Prices';
import MathUtils from 'utils/math';
import Dialog from 'storage/Dialog';
import BN from 'bn.js';
import math from 'utils/math';
import {Adaptors} from 'src/adaptors/adaptor';

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
  const priceContext = useContext(PricesStore.Context);
  const dialogContext = useContext(Dialog.Context);

  const routeValue = route.params?.value ?? 0;
  const wallet: Wallet = route.params.wallet;
  const receiver: string = route.params.receiver;

  const [isUSDMode, setUSDMode] = useState<boolean>(
    route.params?.isUSDMode ?? true,
  );
  const [value, setValue] = useState<number>(
    routeValue === 0 ? '' : routeValue,
  );
  const [alternativeValue, setAlternativeValue] = useState<number>(0);

  const [usdFee, setUsdFee] = useState<number>(0);
  const [plankFee, setPlankFee] = useState<BN>(new BN(0));

  const onSuccess = async () => {
    if (value <= 0 || alternativeValue <= 0) {
      navigation.navigate('Send', {
        isUSDMode: isUSDMode,
        value: value,
      });
    }

    const currencyValue = isUSDMode ? alternativeValue : value;
    const api = Adaptors.get(wallet.network);
    const planksValue = math.convertToPlanck(
      String(currencyValue),
      api.decimals,
    );
    if (new BN(wallet.planks).cmp(planksValue.add(plankFee)) < 0) {
      dialogContext.dispatch(
        Dialog.open('Not enough balance', '', () =>
          dialogContext.dispatch(Dialog.close()),
        ),
      );
      return;
    }
    const transferValidation = await api.isValidTransfer(
      wallet.address,
      receiver,
      planksValue,
      plankFee,
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

    navigation.navigate('Send', {
      isUSDMode: isUSDMode,
      value: value,
    });
  };

  useEffect(() => {
    if (value <= 0) {
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
      setAlternativeValue(aValue);
    })();
  }, [value, isUSDMode]);

  useEffect(() => {
    if (value <= 0 || alternativeValue <= 0) {
      return;
    }

    const currencyValue = isUSDMode ? alternativeValue : value;

    (async () => {
      const api = Adaptors.get(wallet.network);
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
      setPlankFee(fee);
      setUsdFee(usdFee);
    })();
  }, [alternativeValue]);

  useEffect(() => {
    if (value <= 0 || alternativeValue <= 0) {
      return;
    }

    navigation.setOptions({
      headerRight: () => {
        return <SuccessButton size={35} onPress={onSuccess} />;
      },
    });
  }, [alternativeValue, usdFee]);

  return (
    <View style={styles.chats}>
      <AmountInput
        width={'95%'}
        onChangeText={(text, mode) => {
          const v = parseFloat(text);
          setValue(isNaN(v) ? 0 : v);
          setUSDMode(mode);
        }}
        value={String(value)}
        usdMode={isUSDMode}
        alternativeValue={alternativeValue}
        fee={usdFee}
        currency={wallet.currency}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chats: {
    marginTop: 15,
    alignItems: 'center',
    flex: 1,
  },
});
