import React from 'react';
import {ActivityIndicator, View} from 'react-native';

/**
 * Basic loader
 * @category Components
 */
export const Loader = () => {
  return (
    <View style={{flex: 1, justifyContent: 'center'}}>
      <ActivityIndicator testID="loader" size={80} color="#2AB2E2" />
    </View>
  );
};
