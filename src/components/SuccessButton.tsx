import React from 'react';
import {TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 * @category Components
 */
export const SuccessButton = ({
  size,
  onPress,
}: {
  size: number;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Ionicons name="checkmark" size={size} color="#888888" />
    </TouchableOpacity>
  );
};
