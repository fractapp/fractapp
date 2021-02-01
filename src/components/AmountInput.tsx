import React, {useRef, useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Currency, getSymbol} from 'models/wallet';

/**
 * Text input for amount
 * @category Components
 */
export const AmountInput = ({
  alternativeValue,
  fee,
  currency,
  usdMode = false,
  value = '',
  width = '100%',
  onChangeText,
}: {
  alternativeValue: number;
  fee: number;
  currency: Currency;
  usdMode?: boolean;
  value?: string;
  width?: string;
  onChangeText: (text: string, isUSDMode: boolean) => void;
}) => {
  const [isUSDMode, setUSDMode] = useState<boolean>(usdMode);
  const [text, setText] = useState<string>(value);

  const textInputRef = useRef<TextInput>(null);
  return (
    <View style={{width: width, alignItems: 'center'}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <Text style={styles.value}>{isUSDMode && '$'}</Text>
        <TextInput
          ref={textInputRef}
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
          value={text}
          autoFocus={true}
          onChangeText={(text) => {
            setText(text);
            onChangeText(text, isUSDMode);
          }}
          textAlign={'center'}
          keyboardType={'decimal-pad'}
          placeholderTextColor={'#BFBDBD'}
        />
        <Text style={styles.valueCurrency}>
          {!isUSDMode && ' ' + getSymbol(currency)}
        </Text>
      </View>

      <TouchableOpacity
        style={{
          width: 30,
          height: 30,
          position: 'absolute',
          right: 20,
          top: 8,
        }}
        onPress={() => {
          onChangeText(text, !isUSDMode);
          setUSDMode(!isUSDMode);
        }}>
        <Image
          source={require('assets/img/change.png')}
          style={{width: 30, height: 30}}
        />
      </TouchableOpacity>
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
    </View>
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
