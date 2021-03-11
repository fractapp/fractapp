import React from 'react';
import ReactNative from 'react-native';

/**
 * Text input
 * @category Components
 */
export const TextInput = ({
  placeholder,
  defaultValue = '',
  width = '100%',
  onChangeText,
}: {
  placeholder: string;
  defaultValue?: string;
  width?: string;
  onChangeText: (text: string) => void;
}) => {
  return (
    <ReactNative.TextInput
      style={[styles.input, {width: width}]}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={'#BFBDBD'}
      autoCompleteType={'name'}
      secureTextEntry={false}
      defaultValue={defaultValue}
    />
  );
};

const styles = ReactNative.StyleSheet.create({
  input: {
    borderColor: '#CCCCCC',
    borderBottomWidth: 1,
    height: 40,
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'black',
  },
});
