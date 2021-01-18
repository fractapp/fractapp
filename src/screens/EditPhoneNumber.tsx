import React, {useContext, useEffect, useState} from 'react';
import {
  StyleSheet,
  TextInput,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {
  formatPhoneNumberIntl,
  isValidPhoneNumber,
  parsePhoneNumber,
  getCountryCallingCode,
} from 'react-phone-number-input';
import en from 'react-phone-number-input/locale/en';
import {SuccessButton} from 'components/SuccessButton';
import BackendApi from 'utils/backend';
import Dialog from 'storage/Dialog';
import GlobalStore from 'storage/Global';

export const EditPhoneNumber = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const dialogContext = useContext(Dialog.Context);

  const [countryCode, setCountryCode] = useState<string>('US');
  const [number, setNumber] = useState<string>('1');
  const [countryCodeLength, setCountryCodeLength] = useState<number>(1);
  const [countryName, setCountryName] = useState<string>('United States');
  const selectedCountryCode = route.params?.selectedCountryCode;

  const onSuccess = async () => {
    if (!isValidPhoneNumber('+' + number)) {
      dialogContext.dispatch(
        Dialog.open(
          'Invalid phone number',
          'Please validate and write number again',
          () => dialogContext.dispatch(Dialog.close()),
        ),
      );
      return;
    }

    try {
      BackendApi.sendCode(
        number,
        BackendApi.CodeType.Phone,
        BackendApi.CheckType.Auth,
      );
    } catch (e) {
      console.log(e);
    }

    navigation.navigate('ConfirmCode', {
      value: number,
      type: BackendApi.CodeType.Phone,
    });
  };

  useEffect(() => {
    let url = 'http://ip-api.com/json/';
    fetch(url)
      .then((response) => response.json())
      .then((responseJson) => {
        const countryCode = responseJson.countryCode;
        const numberCountryCode = getCountryCallingCode(countryCode);
        setCountryCodeLength(numberCountryCode.length);
        setCountryCode(countryCode);
        setCountryName(en[countryCode]);

        setNumber(numberCountryCode);
      })
      .catch((error) => {});
  }, []);
  useEffect(() => {
    if (selectedCountryCode != null) {
      const numberCountryCode = getCountryCallingCode(selectedCountryCode);

      setCountryCodeLength(numberCountryCode.length);
      setCountryCode(selectedCountryCode);
      setCountryName(en[selectedCountryCode]);

      setNumber(numberCountryCode);
    }
  }, [selectedCountryCode]);
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <SuccessButton size={35} onPress={onSuccess} />;
      },
    });

    if (number.length < countryCodeLength) {
      setCountryCode('');
      setCountryName('Invalid phone number');
    }

    if (countryCode != '') {
      return;
    }
    if (isValidPhoneNumber('+' + number)) {
      setCountryCode(parsePhoneNumber('+' + number).country);
      setCountryName(en[parsePhoneNumber('+' + number).country]);
    } else {
      setCountryName('Invalid phone number');
    }
  }, [number]);

  return (
    <View style={styles.box}>
      <TouchableOpacity
        style={styles.countryInput}
        onPress={() => navigation.navigate('SelectCountry')}>
        <Text style={styles.title}>Country</Text>
        <Text style={[styles.value, {marginTop: 6}]}>{countryName}</Text>
      </TouchableOpacity>
      <View style={styles.phoneInput}>
        <Text style={styles.title}>Phone</Text>
        <View
          style={{
            flexDirection: 'row',
            alignContent: 'center',
            marginTop: 0,
          }}>
          <Text style={[styles.value, {alignSelf: 'center'}]}>+</Text>
          <TextInput
            style={[
              styles.value,
              {
                width: '100%',
              },
            ]}
            value={number}
            onChangeText={(text) => {
              if (isValidPhoneNumber('+' + text)) {
                setNumber(formatPhoneNumberIntl('+' + text).substring(1));
              } else {
                setNumber(text);
              }
            }}
            placeholder={''}
            keyboardType={'phone-pad'}
            placeholderTextColor={'#BFBDBD'}
            autoCompleteType={'tel'}
            textContentType={'telephoneNumber'}
            secureTextEntry={false}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryInput: {
    width: '85%',
    marginTop: 20,
    paddingBottom: 5,
    borderColor: '#CCCCCC',
    borderBottomWidth: 1,
  },
  phoneInput: {
    width: '85%',
    marginTop: 20,
    borderColor: '#CCCCCC',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: '#888888',
  },
  value: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'black',
  },
});
