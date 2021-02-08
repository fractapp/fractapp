import React, {useState} from 'react';
import {Linking, StyleSheet, Text, View} from 'react-native';
import {BlueButton, WhiteButton} from 'components/index';
import CheckBox from '@react-native-community/checkbox';

export const Legal = ({navigation}: {navigation: any}) => {
  const [toggleCheckBox, setToggleCheckBox] = useState(false);

  return (
    <View style={{flexDirection: 'column', flex: 1, alignItems: 'center'}}>
      <Text style={styles.title}>
        Please read Terms & Conditions and Privacy Policy
      </Text>
      <View style={{width: '100%', alignItems: 'center', marginTop: 70}}>
        <WhiteButton
          text={'Terms & Conditions'}
          height={50}
          width="90%"
          onPress={() =>
            Linking.openURL('http://fractapp.com/legal/app-tos.html')
          }
        />
        <View style={{marginTop: 20, width: '90%'}}>
          <WhiteButton
            text={'Privacy Policy'}
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
            I have read, understood, and agree with the Terms & Conditions and
            Privacy Policy
          </Text>
        </View>
        <BlueButton
          text={'Next'}
          height={50}
          disabled={!toggleCheckBox}
          onPress={() => navigation.navigate('SettingWallet')}
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
