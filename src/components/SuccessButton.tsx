import React from 'react';
import {TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 * Button for success action
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
    <TouchableOpacity testID={'successBtn'} onPress={onPress}>
      <Ionicons name="checkmark" size={size} color="#888888" />
    </TouchableOpacity>
  );
};
