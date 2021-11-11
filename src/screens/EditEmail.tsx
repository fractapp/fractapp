import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import {SuccessButton} from 'components/SuccessButton';
import FractappClient from 'utils/fractappClient';
import Dialog from 'storage/Dialog';
import * as EmailValidator from 'email-validator';
import StringUtils from 'utils/string';
import { useDispatch } from 'react-redux';

/**
 * Screen with editing email in fractapp
 * @category Screens
 */
export const EditEmail = ({navigation}: {navigation: any}) => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState<string>('');

  const onSuccess = async () => {
    if (!EmailValidator.validate(email)) {
      dispatch(
        Dialog.actions.showDialog(
          {
            title: StringUtils.texts.InvalidEmailTitle,
            text: StringUtils.texts.InvalidEmailText,
          }
        ),
      );
      return;
    }

    try {
      FractappClient.sendCode(
        email,
        FractappClient.CodeType.Email
      );
    } catch (e) {
      console.log(e);
    }

    navigation.navigate('ConfirmCode', {
      value: email,
      type: FractappClient.CodeType.Email,
    });
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <SuccessButton size={35} onPress={onSuccess} />;
      },
    });
  }, [email]);

  return (
    <View style={styles.box}>
      <View style={styles.emailInput}>
        <View
          style={{
            flexDirection: 'row',
            alignContent: 'center',
            marginTop: 0,
          }}>
          <TextInput
            style={[
              styles.value,
              {
                width: '100%',
              },
            ]}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
            }}
            placeholder={StringUtils.texts.edit.email}
            keyboardType={'email-address'}
            placeholderTextColor={'#BFBDBD'}
            autoCompleteType={'email'}
            textContentType={'emailAddress'}
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
  emailInput: {
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
