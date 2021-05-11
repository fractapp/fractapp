import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {WhiteButton} from 'components/WhiteButton';
import StringUtils from 'utils/string';

/**
 * First setting for wallet
 * @category Screens
 */
export const SettingWallet = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const seed = route.params.seed;

  return (
    <View
      style={{
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
      }}>
      <Text style={styles.title}>{StringUtils.texts.titles.settingWallet}</Text>
      <View style={{width: '100%', alignItems: 'center', marginTop: 70}}>
        <WhiteButton
          text={StringUtils.texts.settingWallet.create}
          height={50}
          width="90%"
          onPress={() => navigation.navigate('SaveWallet', {seed: seed})}
        />
        <View style={{marginTop: 20, width: '90%'}}>
          <WhiteButton
            text={StringUtils.texts.settingWallet.backup}
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
