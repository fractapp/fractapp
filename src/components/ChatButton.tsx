import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

/**
 * Chat style button
 * @category Components
 */
export const ChatButton = ({
  text,
  onPress,
}: {
  text: string;
  onPress: () => void;
}) => {
  return (
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
          backgroundColor: 'white',
        },
      ]}
      onPress={onPress}>
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonText: {
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: '#2F2F2F',
  },
  button: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2AB2E2',
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
