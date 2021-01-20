import React, {useState} from 'react';
import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';

/**
 * Text input for amount
 * @category Components
 */
export const AmountInput = ({
  width = '100%',
  onChangeText,
}: {
  width?: string;
  onChangeText?: (text: string) => void;
}) => {
  return (
    <View style={[styles.input, {width: width}]}>
      <TextInput
        style={[
          styles.value,
          {
            width: '100%',
          },
        ]}
        onChangeText={onChangeText}
        placeholder={'Enter amount'}
        keyboardType={'numbers-and-punctuation'}
        placeholderTextColor={'#BFBDBD'}
        autoCompleteType={'username'}
        textContentType={'username'}
        secureTextEntry={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    marginTop: 30,
    borderBottomWidth: 1,
    borderColor: '#DADADA',
  },
  value: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'black',
  },
});
