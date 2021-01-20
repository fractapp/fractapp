import React, {useState} from 'react';
import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';

/**
 * Text input for amount
 * @category Components
 */
export const AmountValue = ({
  value,
  width = '100%',
  onPress,
}: {
  value: string;
  width?: string;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity style={[styles.input, {width: width}]} onPress={onPress}>
      <TextInput
        style={[
          styles.value,
          {
            width: '100%',
          },
        ]}
        value={value}
        editable={false}
        placeholder={'Enter amount'}
        keyboardType={'numbers-and-punctuation'}
        placeholderTextColor={'#BFBDBD'}
        autoCompleteType={'username'}
        textContentType={'username'}
        secureTextEntry={false}
      />
    </TouchableOpacity>
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
