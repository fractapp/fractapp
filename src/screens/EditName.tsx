import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import {SuccessButton} from 'components/SuccessButton';
import Dialog from 'storage/Dialog';
import GlobalStore from 'storage/Global';
import backend from 'utils/backend';
import StringUtils from 'utils/string';

/**
 * Screen with editing name in fractapp
 * @category Screens
 */
export const EditName = ({navigation}: {navigation: any}) => {
  const regExp = new RegExp('[^A-Za-z0-9_-\\s]');
  const globalContext = useContext(GlobalStore.Context);
  const dialogContext = useContext(Dialog.Context);

  const [name, setName] = useState<string>(globalContext.state.profile.name);
  const [isErrorName, setNameIsError] = useState<boolean>(false);

  const onSuccess = async () => {
    const validName = name.trim();
    if (validName === globalContext.state.profile.name || validName === '') {
      navigation.goBack();
      return;
    }

    if (
      regExp.test(validName) ||
      validName.length < 4 ||
      validName.length > 32 ||
      !(await backend.updateProfile(
        validName,
        globalContext.state.profile.username,
      ))
    ) {
      dialogContext.dispatch(
        Dialog.open(
          StringUtils.texts.InvalidNameTitle,
          StringUtils.texts.InvalidNameText,
          () => dialogContext.dispatch(Dialog.close()),
        ),
      );
      return;
    }

    globalContext.dispatch(GlobalStore.setUpdatingProfile(true));
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
