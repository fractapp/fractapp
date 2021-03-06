import React from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {BlueButton} from 'components/BlueButton';
import StringUtils from 'utils/string';

/**
 * Start screen for new users
 * @category Screens
 */
export const Start = ({navigation}: {navigation: any}) => {
  return (
    <View style={{flexDirection: 'column', flex: 1, alignItems: 'center'}}>
      <Image source={require('assets/img/logo.png')} style={styles.logo} />
      <Text style={styles.welcomeText}>{StringUtils.texts.WelcomeTitle}</Text>
      <Text style={styles.description}>
        {StringUtils.texts.WelcomeDescription}
      </Text>

      <View style={styles.nextBtn}>
        <BlueButton
          text={StringUtils.texts.StartBtnTitle}
          height={50}
          onPress={() => navigation.navigate('Legal')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logo: {
    marginTop: 230,
    width: 61,
    height: 61,
    marginBottom: 10,
  },
  nextBtn: {
    width: '80%',
    position: 'absolute',
    bottom: 40,
  },
  welcomeText: {
    fontSize: 25,
    fontFamily: 'Roboto-Regular',
    color: '#2AB2E2',
  },
  description: {
    marginTop: 5,
    fontSize: 13,
    fontFamily: 'Roboto-Regular',
    color: '#888888',
  },
});
