import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {getSymbol, Wallet} from 'types/wallet';
import PricesStore from 'storage/Prices';
import {Adaptors} from 'adaptors/adaptor';
import BN from 'bn.js';
import MathUtils from 'utils/math';
import math from 'utils/math';
import StringUtils from 'utils/string';

/**
 * Text input for amount
 * @category Components
 */
export const AmountInput = ({
  wallet,
  receiver,
  usdMode,
  onChangeValues,
  onSetLoading,
  defaultValue,
  width = '100%',
}: {
  wallet: Wallet;
  receiver: string;
  usdMode: boolean;
  onChangeValues: (
    value: string,
    usdValue: number,
    alternativeValue: number,
    planksValue: BN,
    planksFee: BN,
    usdFee: number,
    usdMode: boolean,
    isValid: boolean,
  ) => void;
  onSetLoading: (isLoading: boolean) => void;
  defaultValue: string;
  width?: string;
}) => {
  const priceContext = useContext(PricesStore.Context);
  const api = Adaptors.get(wallet.network);
  const textInputRef = useRef<TextInput>(null);

  const [isValid, setValid] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string>('');

  const [isFeeLoading, setFeeLoading] = useState<boolean>(false);
  const [isUSDMode, setUSDMode] = useState<boolean>(usdMode);

  const [usdValue, setUSDValue] = useState<number>(0);
  const [planksValue, setPlanksValue] = useState<BN>(new BN(0));

  const [value, setValue] = useState<string>(defaultValue);

  const [alternativeValue, setAlternativeValue] = useState<number>(0);

  const [usdFee, setUsdFee] = useState<number>(0);
  const [planksFee, setPlanksFee] = useState<BN>(new BN(0));

  const [tick, setTick] = useState<number>(0);

  const onChangeText = (text: string, usdMode: boolean) => {
    setValue(text);
    setUSDMode(usdMode);
    resetValues(true, '');

    if (text.length > 0) {
      const v = parseFloat(text);
      const p = new BN(math.convertToPlanck(text, api.decimals));
      if (
        (usdMode && (isNaN(v) || v <= 0)) ||
        (!usdMode && p.cmp(new BN(0)) <= 0)
      ) {
        setValid(false);
        onChangeValues('', 0, 0, new BN(0), new BN(0), 0, isUSDMode, false);
        return;
      }
    }

    setValid(true);
    setErrorText('');

    if (usdMode) {
      const v = parseFloat(text);
      const usd = isNaN(v) ? 0 : v;
      setUSDValue(usd);

      const p = MathUtils.calculatePlanksValue(
        usd,
        api.decimals,
        priceContext.state.get(wallet.currency) ?? 0,
      );
      setPlanksValue(p);

      onSetLoading(true);
      setFeeLoading(true);
    } else {
      const p = new BN(math.convertToPlanck(text, api.decimals));
      setPlanksValue(p);

      const usd = MathUtils.calculateUsdValue(
        p,
        api.decimals,
        priceContext.state.get(wallet.currency) ?? 0,
      );
      setUSDValue(usd);

      onSetLoading(true);
      setFeeLoading(true);
    }
  };

  const resetValues = (isValid: boolean, errorText: string) => {
    setValid(isValid);
    setErrorText(errorText);

    setPlanksValue(new BN(0));
    setUSDValue(0);

    setAlternativeValue(0);
    setUsdFee(0);
    setPlanksFee(new BN(0));

    onSetLoading(false);
    setFeeLoading(false);

    onChangeValues('', 0, 0, new BN(0), new BN(0), 0, isUSDMode, isValid);
  };

  const validateParams = async (): Promise<boolean> => {
    const plankViewValue = MathUtils.convertFromPlanckToViewDecimals(
      planksValue,
      api.decimals,
      api.viewDecimals,
      true,
    );
    if (
      planksValue!.cmp(new BN(0)) <= 0 ||
      usdValue <= 0 ||
      (isUSDMode && plankViewValue <= 0)
    ) {
      resetValues(!(value.length > 0), '');
      return false;
    }

    if (new BN(wallet.planks).cmp(planksValue.add(planksFee)) < 0) {
      resetValues(false, StringUtils.texts.NotEnoughBalanceErr);
      return false;
    }

    const transferValidation = await api.isValidTransfer(
      wallet.address,
      receiver,
      planksValue,
      planksFee,
    );

    if (!transferValidation.isOk) {
      resetValues(false, transferValidation.errorMsg);
      return false;
    }

    return true;
  };

  useEffect(() => {
    textInputRef?.current?.focus();
  }, [textInputRef]);
  useEffect(() => {
    console.log('default value: ' + defaultValue);
    if (defaultValue === undefined || defaultValue === '') {
      return;
    }

    onChangeText(defaultValue, isUSDMode);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setTick((prevTick: number) => prevTick + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    console.log('tick: ' + tick);

    if (tick === 0 || !isValid) {
      return;
    }
    validateParams().then(async (isValidValue) => {
      if (!isValidValue) {
        return;
      }

      const aValue = isUSDMode
        ? MathUtils.convertFromPlanckToViewDecimals(
            planksValue,
            api.decimals,
            api.viewDecimals,
            true,
          )
        : usdValue;
      setAlternativeValue(aValue);

      const fee = await api.calculateFee(planksValue, receiver);
      const usdFee = await MathUtils.calculateUsdValue(
        fee,
        api.decimals,
        priceContext.state.get(wallet.currency) ?? 0,
      );
      setPlanksFee(fee);
      setUsdFee(usdFee);

      const isValidValueStill = validateParams();
      if (!isValidValueStill) {
        return false;
      }

      setValid(true);
      setErrorText('');

      onSetLoading(false);
      setFeeLoading(false);

      onChangeValues(
        value,
        usdValue,
        aValue,
        planksValue,
        fee,
        usdFee,
        isUSDMode,
        true,
      );
    });
  }, [tick]);

  return (
    <View style={{width: width, alignItems: 'center'}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <Text style={styles.value}>{isUSDMode && '$'}</Text>
        <TextInput
          style={[
            styles.value,
            {
              paddingLeft: 0,
              paddingRight: 0,
              paddingBottom: 0,
              paddingTop: 0,
              marginTop: 8,
              marginBottom: 8,
            },
          ]}
          ref={textInputRef}
          autoFocus={true}
          onChangeText={(text) => {
            onChangeText(text, isUSDMode);
          }}
          textAlign={'center'}
          keyboardType={'decimal-pad'}
          placeholderTextColor={'#BFBDBD'}
          value={value}
        />
        <Text style={styles.valueCurrency}>
          {!isUSDMode && ' ' + getSymbol(wallet.currency)}
        </Text>
      </View>

      <TouchableOpacity
        style={{
          width: 30,
          height: 30,
          position: 'absolute',
          right: 15,
          top: 8,
        }}
        onPress={() => {
          onChangeText(String(alternativeValue), !isUSDMode);
          setUSDMode(!isUSDMode);
        }}>
        <Image
          source={require('assets/img/change.png')}
          style={{width: 30, height: 30}}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          width: 30,
          height: 30,
          position: 'absolute',
          left: 15,
          top: 8,
        }}
        onPress={async () => {
          onSetLoading(true);
          setFeeLoading(true);

          let v = new BN(wallet.planks);

          setValue(
            math.convertFromPlanckToString(v.sub(planksFee), api.decimals),
          );
          await api.calculateFee(v, receiver).then((fee) => {
            v = v.sub(fee);
            onChangeText(
              math.convertFromPlanckToString(v, api.decimals),
              false,
            );
          });
        }}>
        <Image
          source={require('assets/img/max.png')}
          style={{width: 30, height: 30}}
        />
      </TouchableOpacity>
      <View style={[isValid ? styles.line : styles.redLine, {width: width}]} />
      <View style={{flexDirection: 'row', width: width}}>
        {isFeeLoading ? (
          <ActivityIndicator testID="loader" size={25} color="#2AB2E2" />
        ) : !isValid ? (
          <Text style={styles.errorText}>{errorText}</Text>
        ) : (
          <>
            <View style={{width: '50%', alignItems: 'flex-start'}}>
              {usdFee !== 0 && (
                <Text style={[styles.subValue]}>
                  {StringUtils.texts.FeeTitle} ${usdFee}
                </Text>
              )}
            </View>
            <View style={{width: '50%', alignItems: 'flex-end'}}>
              {!isFeeLoading && alternativeValue !== 0 && (
                <Text style={styles.subValue}>
                  {isUSDMode
                    ? `${alternativeValue} ${getSymbol(wallet.currency)}`
                    : `$${alternativeValue}`}
                </Text>
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  line: {
    borderBottomWidth: 1,
    borderColor: '#DADADA',
  },
  redLine: {
    borderBottomWidth: 1,
    borderColor: '#EA4335',
  },
  value: {
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'black',
  },
  errorText: {
    marginTop: 5,
    marginLeft: 5,
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: '#EA4335',
  },
  valueCurrency: {
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: '#888888',
  },
  subValue: {
    marginTop: 7,
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'black',
  },
});
