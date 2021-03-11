import React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';

/**
 * @category Components
 */
export const BlueButton = ({
  text,
  height,
  disabled = false,
  width = '100%',
  onPress,
}: {
  text: string;
  height: number;
  disabled?: boolean;
  width?: string;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          height: height,
          width: width,
          backgroundColor: disabled ? '#99E4FF' : '#2AB2E2',
        },
      ]}
      disabled={disabled}
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
    color: 'white',
  },
  button: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
