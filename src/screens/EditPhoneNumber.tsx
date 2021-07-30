import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  TextInput,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {SuccessButton} from 'components/SuccessButton';
import BackendApi from 'utils/api';
import Dialog from 'storage/Dialog';
import backend from 'utils/api';
import StringUtils from 'utils/string';
import { useDispatch } from 'react-redux';
// @ts-ignore
import {
  formatPhoneNumberIntl,
  isValidPhoneNumber,
  parsePhoneNumber,
  getCountryCallingCode,
} from 'react-phone-number-input';
// @ts-ignore
import en from 'react-phone-number-input/locale/en';

/**
 * Screen with editing phone number in fractapp
 * @category Screens
 */
export const EditPhoneNumber = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const dispatch = useDispatch();

  const [countryCode, setCountryCode] = useState<string>('US');
  const [number, setNumber] = useState<string>('1');
  const [countryCodeLength, setCountryCodeLength] = useState<number>(1);
  const [countryName, setCountryName] = useState<string>('United States');
  const selectedCountryCode = route.params?.selectedCountryCode;

  const onSuccess = async () => {
    if (!isValidPhoneNumber('+' + number)) {
      dispatch(
        Dialog.actions.showDialog({
          title: StringUtils.texts.InvalidPhoneNumberTitle,
          text: StringUtils.texts.InvalidPhoneNumberText,
          onPress: () => dispatch(Dialog.actions.hideDialog()),
        }),
      );
      return;
    }

    try {
      BackendApi.sendCode(
        number,
        BackendApi.CodeType.Phone
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
    if (selectedCountryCode != null) {
      return;
    }

    (async () => {
      const local = await backend.getLocalByIp();
      const numberCountryCode = getCountryCallingCode(local);
      setCountryCodeLength(numberCountryCode.length);
      setCountryCode(local);
      setCountryName(en[local]);

      setNumber(numberCountryCode);
    })();
  }, []);
  useEffect(() => {
    if (selectedCountryCode == null) {
      return;
    }

    const numberCountryCode = getCountryCallingCode(selectedCountryCode);

    setCountryCodeLength(numberCountryCode.length);
    setCountryCode(selectedCountryCode);
    setCountryName(en[selectedCountryCode]);

    setNumber(numberCountryCode);
  }, [selectedCountryCode]);
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <SuccessButton size={35} onPress={onSuccess} />;
      },
    });

    if (number.length < countryCodeLength) {
      setCountryCode('');
      setCountryName(StringUtils.texts.edit.invalidPhoneNumber);
    }

    if (countryCode !== '') {
      return;
    }
    if (isValidPhoneNumber('+' + number)) {
      const info = parsePhoneNumber('+' + number);
      if (info?.country == null) {
        return;
      }
      setCountryCode(info.country);
      setCountryName(en[info.country!]);
    } else {
      setCountryName(StringUtils.texts.edit.invalidPhoneNumber);
    }
  }, [number]);

  return (
    <View style={styles.box}>
      <TouchableOpacity
        testID={'selectCountryBtn'}
        style={styles.countryInput}
        onPress={() => navigation.navigate('SelectCountry')}>
        <Text style={styles.title}>{StringUtils.texts.edit.countryTitle}</Text>
        <Text style={[styles.value, {marginTop: 6}]}>{countryName}</Text>
      </TouchableOpacity>
      <View style={styles.phoneInput}>
        <Text style={styles.title}>{StringUtils.texts.edit.phoneTitle}</Text>
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
