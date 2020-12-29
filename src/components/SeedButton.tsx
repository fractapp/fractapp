import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';

/**
 * Button with words from bip39
 * @category Components
 */
export const SeedButton = ({
  prefix,
  text,
  onPress,
}: {
  prefix: string;
  text: string;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity activeOpacity={1} style={styles.button} onPress={onPress}>
      <Text style={styles.prefixText}>{prefix} </Text>
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    opacity: 1,
    margin: 3,
    flexDirection: 'row',
    height: 30,

    paddingLeft: 10,
    paddingRight: 10,

    borderColor: '#888888',
    borderWidth: 0.5,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefixText: {
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: '#CCCCCC',
  },
  buttonText: {
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'black',
  },
});
