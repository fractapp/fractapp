import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getSymbol } from 'types/wallet';
import { Adaptors, TransferValidationArgs } from 'adaptors/adaptor';
import BN from 'bn.js';
import MathUtils from 'utils/math';
import math from 'utils/math';
import StringUtils from 'utils/string';
import { Account } from 'types/account';
import { EnterAmountInfo } from 'types/inputs';
import { TxAction } from 'types/transaction';
import { EnterAmountArgs } from 'types/message';

/**
 * Text input for amount
 * @category Components
 */
export const AmountInput = ({
  account,
  args,
  isChatBotRequest,
  price,
  onChangeValues,
  onSetLoading,
  defaultValue,
  defaultUsdMode,
  isChatBotLimit,
  width = '100%',
}: {
  account: Account;
  args: EnterAmountArgs | TransferValidationArgs;
  isChatBotRequest: boolean;
  price: number;
  onChangeValues: (
    newEnterAmount: EnterAmountInfo
  ) => void;
  onSetLoading: (isLoading: boolean) => void;
  defaultValue: string;
  defaultUsdMode: boolean;
  isChatBotLimit: boolean;
  width?: string;
}) => {
  const api = Adaptors.get(account.network)!;
  const textInputRef = useRef<TextInput>(null);

  const [calculatedFee, setCalculatedFee] = useState(isChatBotRequest ? new BN((args as EnterAmountArgs).fee) : null);
  const limit = isChatBotLimit ? new BN((args as EnterAmountArgs).limit!) : new BN(account.balance.transferable);

  const [errorText, setErrorText] = useState<string>('');

  const [isFeeLoading, setFeeLoading] = useState<boolean>(false);
  const [value, setValue] = useState<string>(defaultValue);
  const [forceValue, setForceValue] = useState<string | null>(null);
  const [usdMode, setUsdMode] = useState<boolean>(defaultUsdMode);

  const [isLoadingEnd, setLoadingEnd] = useState<boolean>(false);
  const [isRecall, setRecall] = useState<boolean>(false);

  const [enterAmountInfo, setEnterAmountInfo] = useState<EnterAmountInfo>({
    value: defaultValue,
    alternativeValue: 0,
    usdValue: 0,
    usdFee: 0,
    planksValue: '0',
    planksFee: '0',
    isUSDMode: defaultUsdMode,
    isValid: true,
  });

  const calculateFee = async (sender: string, value: BN): Promise<BN | undefined> => {
    if (calculatedFee == null) {
      const fee = await api.calculateTransferFee(account.address, value, (args as TransferValidationArgs).receiver);
      if (fee === undefined) {
        return undefined;
      }
      setCalculatedFee(fee);
      return fee;
    } else {
      return calculatedFee;
    }
  };

  const calculateValues = (value: string, isForce: boolean) => {
    if (isFeeLoading && !isForce) {
      setRecall(true);
      return;
    }

    console.log('calculate value');

    const newEnterAmount: EnterAmountInfo = resetValues(true, '');
    onChangeValues(newEnterAmount);
    newEnterAmount.value = value;
    newEnterAmount.isUSDMode = usdMode;

    setFeeLoading(true);

    if (value.length > 0) {
      const v = parseFloat(value);
      const p = new BN(math.convertToPlanck(value, api.decimals));
      if (
        (newEnterAmount.isUSDMode && (isNaN(v) || v <= 0)) ||
        (!newEnterAmount.isUSDMode && p.cmp(new BN(0)) <= 0)
      ) {
        const emptyValue = resetValues(false, '');
        onChangeValues(emptyValue);
        setEnterAmountInfo(emptyValue);
        setLoadingEnd(true);
        return;
      }
    }

    newEnterAmount.isValid = true;
    setErrorText('');

    if (newEnterAmount.isUSDMode) {
      const v = parseFloat(value);
      const usd = isNaN(v) ? 0 : v;
      newEnterAmount.usdValue = usd;

      const p = MathUtils.calculatePlanksValue(
        usd,
        api.decimals,
        price,
      );
      newEnterAmount.planksValue = p.toString();
    } else {
      const p = new BN(math.convertToPlanck(value, api.decimals));
      newEnterAmount.planksValue = p.toString();

      newEnterAmount.usdValue = MathUtils.calculateUsdValue(
        p,
        api.decimals,
        price,
      );
    }

    const planksValue = new BN(newEnterAmount.planksValue);

    calculateFee(account.address, planksValue).then(async (fee) => {
      if (fee === undefined) {
        const emptyValue = resetValues(false, 'Invalid connection. Please, try again.'); //TODO go to string
        onChangeValues(emptyValue);
        setEnterAmountInfo(emptyValue);
        setErrorText('Invalid connection. Please, try again.');
        setLoadingEnd(true);
        return;
      }
      newEnterAmount.planksFee = fee.toString();
      const validateInfo = await validateParams(newEnterAmount.value, planksValue, newEnterAmount.usdValue, newEnterAmount.isUSDMode, fee);
      if (!validateInfo.isValid) {
        const emptyValue = resetValues(validateInfo.isBeforeResetValid, validateInfo.err);
        onChangeValues(emptyValue);
        setEnterAmountInfo(emptyValue);
        setErrorText(validateInfo.err);
        setLoadingEnd(true);
        return;
      }

      newEnterAmount.alternativeValue = newEnterAmount.isUSDMode
        ? MathUtils.convertFromPlanckToViewDecimals(
          planksValue,
          api.decimals,
          api.viewDecimals,
          true,
        ) : newEnterAmount.usdValue;

      newEnterAmount.usdFee = await MathUtils.calculateUsdValue(
        fee,
        api.decimals,
        price,
      );

      setErrorText('');

      console.log('set');
      setEnterAmountInfo(newEnterAmount);
      onChangeValues(newEnterAmount);
      setLoadingEnd(true);
    });
  };

  useEffect(() => {
    if (value === '') {
      const emptyValue = resetValues(true, '');
      onChangeValues(emptyValue);
      setEnterAmountInfo(emptyValue);
      setLoadingEnd(true);
      return;
    }
    calculateValues(value, false);
  }, [value]);
  useEffect(() => {
    console.log('forceValue: ' + forceValue);
    if (forceValue == null) {
      return;
    }
    calculateValues(forceValue, true);
  }, [forceValue]);

  useEffect(() => {
    onSetLoading(isFeeLoading);
  }, [isFeeLoading]);

  useEffect(() => {
    if (!isLoadingEnd) {
      return;
    }

    setLoadingEnd(false);
    if (isRecall) {
      setForceValue(value);
      setRecall(false);
      console.log('recall');
    } else {
      setFeeLoading(false);
      setForceValue(null);
      console.log('fee loading off');
    }
  }, [isLoadingEnd]);

  const resetValues = (isValid: boolean, errorText: string): EnterAmountInfo => {
    const newEnterAmount: EnterAmountInfo = Object.create(enterAmountInfo);

    newEnterAmount.isValid = isValid;
    setErrorText(errorText);

    newEnterAmount.value = '';
    newEnterAmount.planksValue = (new BN(0)).toString();
    newEnterAmount.usdValue = 0;
    newEnterAmount.alternativeValue = 0;
    newEnterAmount.usdFee = 0;
    newEnterAmount.planksFee = '0';

    return newEnterAmount;
  };

  const validateParams = async (value: string, planksValue: BN, usdValue: number, isUSDMode: boolean, fee: BN): Promise<{
    isBeforeResetValid: boolean,
    isValid: boolean,
    err: string
  }> => {
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
      return {
        isBeforeResetValid: !(value.length > 0),
        isValid: false,
        err: '',
      };
    }


    const transferValidation = await api.isTxValid(
      account.address,
      isChatBotRequest ? null : TxAction.Transfer,
      isChatBotRequest ? {
        limit: limit,
      } : (args as TransferValidationArgs),
      planksValue,
      fee
    );

    if (!transferValidation.isOk) {
      return {
        isBeforeResetValid: false,
        isValid: false,
        err: transferValidation.errorMsg,
      };
    }

    return {
      isBeforeResetValid: true,
      isValid: true,
      err: '',
    };
  };


  return (
    <View style={{width: width, alignItems: 'center'}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <Text style={styles.value}>{usdMode && '$'}</Text>
        <TextInput
          onLayout={() => textInputRef?.current?.focus()}
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
          onChangeText={(text) => {
            setValue(text);
          }}
          textAlign={'center'}
          keyboardType={'decimal-pad'}
          placeholderTextColor={'#BFBDBD'}
          value={value}
        />
        <Text style={styles.valueCurrency}>
          {!usdMode && ' ' + getSymbol(account.currency)}
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
          setUsdMode(!enterAmountInfo.isUSDMode);
          setValue(String(enterAmountInfo.alternativeValue));
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
          let v = limit;
          setUsdMode(false);
          console.log('v1:' + math.convertFromPlanckToString(v, api.decimals));
          setValue(math.convertFromPlanckToString(v, api.decimals));
          if (!isChatBotLimit) {
            calculateFee(account.address, v).then((fee) => {
              if (fee === undefined) {
                const emptyValue = resetValues(false, 'Invalid connection. Please, try again.'); //TODO go to string
                onChangeValues(emptyValue);
                setEnterAmountInfo(emptyValue);
                setErrorText('Invalid connection. Please, try again.');
                setLoadingEnd(true);
                return;
              }
              v = v.sub(fee);
              setValue(math.convertFromPlanckToString(v, api.decimals));
              console.log('v2:' + math.convertFromPlanckToString(v, api.decimals));
            });
          }
        }}>
        <Image
          source={require('assets/img/max.png')}
          style={{width: 30, height: 30}}
        />
      </TouchableOpacity>
      <View style={[!enterAmountInfo.isValid && !isFeeLoading ? styles.redLine : styles.line, {width: width}]} />
      <View style={{flexDirection: 'row', width: width}}>
        {isFeeLoading ? (
          <ActivityIndicator testID="loader" size={25} color="#2AB2E2" />
        ) : !enterAmountInfo.isValid ? (
          <Text style={styles.errorText}>{errorText}</Text>
        ) : (
          <>
            <View style={{width: '50%', alignItems: 'flex-start'}}>
              {!isChatBotLimit && enterAmountInfo.usdFee !== 0 && (
                <Text style={[styles.subValue]}>
                  {StringUtils.texts.FeeTitle} ${enterAmountInfo.usdFee}
                </Text>
              )}
            </View>
            <View style={{width: '50%', alignItems: 'flex-end'}}>
              {!isFeeLoading && enterAmountInfo.alternativeValue !== 0 && (
                <Text style={styles.subValue}>
                  {usdMode
                    ? `${enterAmountInfo.alternativeValue} ${getSymbol(account.currency)}`
                    : `$${enterAmountInfo.alternativeValue}`}
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
