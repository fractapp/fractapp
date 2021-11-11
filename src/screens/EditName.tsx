import React, {useEffect, useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import {SuccessButton} from 'components/SuccessButton';
import Dialog from 'storage/Dialog';
import GlobalStore from 'storage/Global';
import backend from 'utils/fractappClient';
import StringUtils from 'utils/string';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Screen with editing name in fractapp
 * @category Screens
 */
export const EditName = ({navigation}: {navigation: any}) => {
  const regExp = new RegExp('[^A-Za-z0-9_-\\s]');
  const dispatch = useDispatch();
  const globalState: GlobalStore.State = useSelector((state: any) => state.global);

  const [name, setName] = useState<string>(globalState.profile!.name);
  const [isErrorName, setNameIsError] = useState<boolean>(false);

  const onSuccess = async () => {
    const validName = name.trim();
    if (validName === globalState.profile!.name || validName === '') {
      navigation.goBack();
      return;
    }

    if (
      regExp.test(validName) ||
      validName.length < 4 ||
      validName.length > 32 ||
      !(await backend.updateProfile(
        validName,
        globalState.profile!.username,
      ))
    ) {
      dispatch(
        Dialog.actions.showDialog({
            title: StringUtils.texts.InvalidNameTitle,
            text: StringUtils.texts.InvalidNameText,
          }
        ),
      );
      return;
    }

    dispatch(GlobalStore.actions.setUpdatingProfile(true));
    navigation.goBack();
    return;
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <SuccessButton size={35} onPress={onSuccess} />;
      },
    });

    setNameIsError(regExp.test(name));
    if (name !== '' && (name.length < 4 || name.length > 32)) {
      setNameIsError(true);
    }
  }, [name]);

  return (
    <View style={styles.box}>
      <View
        style={[
          styles.emailInput,
          {borderColor: isErrorName ? '#EA4335' : '#CCCCCC'},
        ]}>
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
            value={name}
            onChangeText={(text) => {
              setName(text);
            }}
            placeholder={StringUtils.texts.edit.name}
            keyboardType={'default'}
            placeholderTextColor={'#BFBDBD'}
            autoCompleteType={'username'}
            textContentType={'username'}
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
