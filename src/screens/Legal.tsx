import React, {useState} from 'react';
import {Linking, StyleSheet, Text, View} from 'react-native';
import {BlueButton} from 'components/BlueButton';
import {WhiteButton} from 'components/WhiteButton';
import CheckBox from '@react-native-community/checkbox';
import StringUtils from 'utils/string';
import {mnemonicGenerate} from '@polkadot/util-crypto';

/**
 * Screen with legal information
 * @category Screens
 */
export const Legal = ({navigation}: {navigation: any}) => {
  const [toggleCheckBox, setToggleCheckBox] = useState(false);
  const seed = mnemonicGenerate().split(' ');

  return (
    <View style={{flexDirection: 'column', flex: 1, alignItems: 'center'}}>
      <Text style={styles.title}>{StringUtils.texts.legal.title}</Text>
      <View style={{width: '100%', alignItems: 'center', marginTop: 70}}>
        <WhiteButton
          text={StringUtils.texts.legal.tos}
          height={50}
          width="90%"
          onPress={() =>
            Linking.openURL('http://fractapp.com/legal/app-tos.html')
          }
        />
        <View style={{marginTop: 20, width: '90%'}}>
          <WhiteButton
            text={StringUtils.texts.legal.privacyPolicy}
            height={50}
            onPress={() =>
              Linking.openURL(
                'http://fractapp.com/legal/app-privacy-policy.html',
              )
            }
          />
        </View>
      </View>

      <View style={styles.nextBtn}>
        <View
          style={{
            paddingBottom: 20,
            flexDirection: 'row',
            width: '93%',
          }}>
          <CheckBox
            disabled={false}
            value={toggleCheckBox}
            tintColors={{true: '#2AB2E2', false: '#2AB2E2'}}
            onValueChange={(newValue) => setToggleCheckBox(newValue)}
          />
          <Text
            style={styles.checkBoxText}
            onPress={() => setToggleCheckBox(!toggleCheckBox)}>
            {StringUtils.texts.legal.checkbox}
          </Text>
        </View>
        <BlueButton
          text={StringUtils.texts.NextBtnTitle}
          height={50}
          disabled={!toggleCheckBox}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{name: 'SettingWallet', params: {seed: seed}}],
            })
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    width: '90%',
    marginTop: 80,
    fontSize: 23,
    fontFamily: 'Roboto-Regular',
    color: '#2AB2E2',
  },
  checkBoxText: {
    fontSize: 13,
    fontFamily: 'Roboto-Regular',
    color: 'black',
  },
  nextBtn: {
    width: '80%',
    position: 'absolute',
    bottom: 40,
  },
  description: {
    marginTop: 5,
    fontSize: 13,
    fontFamily: 'Roboto-Regular',
    color: '#888888',
  },
});
