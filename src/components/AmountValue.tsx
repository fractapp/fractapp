import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Currency, getSymbol} from 'types/wallet';

/**
 * View with amount value
 * @category Components
 */
export const AmountValue = ({
  value,
  alternativeValue,
  fee,
  currency,
  isUSDMode,
  width = '100%',
  onPress,
}: {
  value: string;
  alternativeValue: number;
  fee: number;
  currency: Currency;
  isUSDMode: boolean;
  width?: string;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity
      style={{width: width, alignItems: 'center'}}
      onPress={onPress}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <Text style={styles.value}>{isUSDMode && value !== '' && '$'}</Text>
        <TextInput
          style={[
            styles.value,
            {
              color: value === '' ? '#BFBDBD' : 'black',
              width: value === '' ? width : 'auto',
              alignSelf: value === '' ? 'flex-start' : 'center',
              paddingLeft: 0,
              paddingRight: 0,
              paddingBottom: 0,
              paddingTop: 0,
              marginTop: 8,
              marginBottom: 8,
            },
          ]}
          editable={false}
          value={value === '' ? 'Enter amount' : String(value)}
          keyboardType={'decimal-pad'}
        />
        <Text style={styles.valueCurrency}>
          {!isUSDMode && value !== '' && ' ' + getSymbol(currency)}
        </Text>
      </View>

      <View style={[styles.line, {width: width}]} />
      <View style={{flexDirection: 'row', width: width}}>
        <View style={{width: '50%', alignItems: 'flex-start'}}>
          {fee !== 0 && <Text style={[styles.subValue]}>Fee ${fee}</Text>}
        </View>
        <View style={{width: '50%', alignItems: 'flex-end'}}>
          {alternativeValue !== 0 && (
            <Text style={styles.subValue}>
              {isUSDMode
                ? `${alternativeValue} ${getSymbol(currency)}`
                : `$${alternativeValue}`}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  line: {
    borderBottomWidth: 1,
    borderColor: '#DADADA',
  },
  value: {
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'black',
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
