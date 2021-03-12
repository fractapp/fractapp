import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {WhiteButton} from 'components/WhiteButton';

/**
 * First setting for wallet
 * @category Screens
 */
export const SettingWallet = ({navigation}: {navigation: any}) => {
  return (
    <View
      style={{
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
      }}>
      <Text style={styles.title}>Setting wallet</Text>
      <View style={{width: '100%', alignItems: 'center', marginTop: 70}}>
        <WhiteButton
          text={'Create new wallet'}
          height={50}
          width="90%"
          onPress={() => navigation.navigate('SaveWallet')}
        />
        <View style={{marginTop: 20, width: '90%'}}>
          <WhiteButton
            text={'I have a wallet'}
            height={50}
            onPress={() => navigation.navigate('ImportWallet')}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    marginTop: 80,
    fontSize: 25,
    fontFamily: 'Roboto-Regular',
    color: '#2AB2E2',
  },
});
