import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

/**
 * Chat style button
 * @category Components
 */
export const ChatButton = ({
  text,
  show = true,
  onPress,
}: {
  text: string;
  show?: boolean;
  onPress: () => void;
}) => {
  return show ? (
    <TouchableOpacity
      style={[
        styles.button,
        {
          marginTop: 5,
          marginBottom: 5,
          marginRight: 10,
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 10,
          paddingBottom: 10,
          backgroundColor: '#BFEEFF',
        },
      ]}
      onPress={onPress}>
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  ) : (
    <View />
  );
};

const styles = StyleSheet.create({
  buttonText: {
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'black',
  },
  button: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
