import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {SuccessButton} from 'components/SuccessButton';
import Dialog from 'storage/Dialog';
import GlobalStore from 'storage/Global';
import backend from 'utils/backend';
import StringUtils from 'utils/string';

/**
 * Screen with editing username in fractapp
 * @category Screens
 */
export const EditUsername = ({navigation}: {navigation: any}) => {
  const regExp = new RegExp('[^A-Za-z0-9_-]');
  const globalContext = useContext(GlobalStore.Context);
  const dialogContext = useContext(Dialog.Context);

  const [username, setUsername] = useState<string>(
    globalContext.state.profile.username,
  );
  const [isExist, setUsernameExist] = useState<boolean>(false);

  const onSuccess = async () => {
    if (
      username.toLowerCase() === globalContext.state.profile.username ||
      username === ''
    ) {
      navigation.goBack();
      return;
    }

    globalContext.dispatch(GlobalStore.setLoading(true));
    if (
      regExp.test(username) ||
      !(await backend.isUsernameFree(username.toLowerCase())) ||
      !(await backend.updateProfile(
        globalContext.state.profile.name,
        username.toLowerCase(),
      ))
    ) {
      if (!(await backend.isUsernameFree(username))) {
        dialogContext.dispatch(
          Dialog.open(
            StringUtils.texts.UsernameIsExistTitle,
            StringUtils.texts.UsernameIsExistText,
            () => dialogContext.dispatch(Dialog.close()),
          ),
        );
      } else {
        dialogContext.dispatch(
          Dialog.open(
            StringUtils.texts.InvalidUsernameTitle,
            StringUtils.texts.InvalidUsernameText,
            () => dialogContext.dispatch(Dialog.close()),
          ),
        );
      }

      globalContext.dispatch(GlobalStore.setLoading(false));
      return;
    }

    globalContext.dispatch(GlobalStore.setLoading(false));
    globalContext.dispatch(GlobalStore.setUpdatingProfile(true));
    navigation.goBack();
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <SuccessButton size={35} onPress={onSuccess} />;
      },
    });

    if (username === '') {
      setUsernameExist(false);
      return;
    }

    if (username.toLowerCase() === globalContext.state.profile.username) {
      setUsernameExist(false);
      return;
    }

    if (regExp.test(username)) {
      setUsernameExist(true);
      return;
    }
    (async () => {
      const isUsernameFree = await backend.isUsernameFree(username);
      setUsernameExist(!isUsernameFree);
      return;
    })();
  }, [username]);

  return (
    <View style={styles.box}>
      <View
        style={[
          styles.emailInput,
          {borderColor: isExist ? '#EA4335' : '#CCCCCC'},
        ]}>
        <View
          style={{
            flexDirection: 'row',
            alignContent: 'center',
            marginTop: 0,
          }}>
          <Text style={[styles.value, {alignSelf: 'center', marginBottom: 5}]}>
            @
          </Text>
          <TextInput
            style={[
              styles.value,
              {
                width: '100%',
              },
            ]}
            value={username}
            onChangeText={(text) => {
              setUsername(text);
            }}
            placeholder={StringUtils.texts.edit.username}
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
