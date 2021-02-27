import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {AmountInput, SuccessButton} from 'components/index';
import {getSymbol, Wallet} from 'types/wallet';
import PricesStore from 'storage/Prices';
import {Api} from 'utils/polkadot';
import MathUtils from 'utils/math';
import Dialog from 'storage/Dialog';
import BN from 'bn.js';

export const EnterAmount = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const [isUSDMode, setUSDMode] = useState<boolean>(
    route.params?.isUSDMode ?? true,
  );
  const routeValue = route.params?.value ?? 0;

  const [value, setValue] = useState<number>(
    routeValue === 0 ? '' : routeValue,
  );
  const [alternativeValue, setAlternativeValue] = useState<number>(0);

  const [usdFee, setUsdFee] = useState<number>(0);
  const [plankFee, setPlankFee] = useState<BN>(new BN(0));

  const priceContext = useContext(PricesStore.Context);
  const dialogContext = useContext(Dialog.Context);

  const wallet: Wallet = route.params.wallet;
  const receiver: string = route.params.receiver;

  const onSuccess = async () => {
    if (value <= 0 || alternativeValue <= 0) {
      navigation.navigate('Send', {
        isUSDMode: isUSDMode,
        value: value,
      });
    }

    const currencyValue = isUSDMode ? alternativeValue : value;
    Api.getInstance(wallet.currency).then(async (api) => {
      const planksValue = api.convertToPlanck(String(currencyValue));
      if (new BN(wallet.planks).cmp(planksValue.add(plankFee)) < 0) {
        dialogContext.dispatch(
          Dialog.open('Not enough balance', '', () =>
            dialogContext.dispatch(Dialog.close()),
          ),
        );
        return;
      }

      const receiverBalance = (await api.balance(receiver))!;
      if (
        receiverBalance.plankValue
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
        .sub(plankFee);

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
              new BN(wallet.planks).sub(plankFee),
            )}`,
            () => dialogContext.dispatch(Dialog.close()),
          ),
        );
        return;
      }

      navigation.navigate('Send', {
        isUSDMode: isUSDMode,
        value: value,
      });
    });
  };

  useEffect(() => {
    if (value <= 0) {
      return;
    }

    MathUtils.calculateValue(
      priceContext,
      wallet.currency,
      value,
      isUSDMode,
    ).then((aValue) => {
      setAlternativeValue(aValue);
    });
  }, [value, isUSDMode]);

  useEffect(() => {
    if (value <= 0 || alternativeValue <= 0) {
      return;
    }

    const currencyValue = isUSDMode ? alternativeValue : value;

    MathUtils.calculateTxInfo(
      priceContext,
      wallet.currency,
      currencyValue,
      receiver,
    ).then((info) => {
      setPlankFee(info.fee);
      setUsdFee(info.usdFee);
    });
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
