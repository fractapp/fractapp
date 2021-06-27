import React from 'react';
import { ActivityIndicator, Dimensions, View } from 'react-native';

/**
 * Basic loader
 * @category Components
 */
export const Loader = () => {
  return (
    <View style={{
      height: Dimensions.get('window').height,
      width: '100%',
      justifyContent: 'center',
    }}>
      <ActivityIndicator testID="loader" size={80} color="#2AB2E2" />
    </View>
  );
};
