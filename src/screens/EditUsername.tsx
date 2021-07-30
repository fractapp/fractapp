import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {SuccessButton} from 'components/SuccessButton';
import Dialog from 'storage/Dialog';
import GlobalStore from 'storage/Global';
import backend from 'utils/api';
import StringUtils from 'utils/string';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Screen with editing username in fractapp
 * @category Screens
 */
export const EditUsername = ({navigation}: {navigation: any}) => {
  const regExp = new RegExp('[^A-Za-z0-9_-]');
  const dispatch = useDispatch();
  const globalState: GlobalStore.State = useSelector((state: any) => state.global);

  const [username, setUsername] = useState<string>(
    globalState.profile!.username,
  );
  const [isExist, setUsernameExist] = useState<boolean>(false);

  const onSuccess = async () => {
    if (
      username.toLowerCase() === globalState.profile!.username ||
      username === ''
    ) {
      navigation.goBack();
      return;
    }

    dispatch(GlobalStore.actions.showLoading());
    if (
      regExp.test(username) ||
      !(await backend.isUsernameFree(username.toLowerCase())) ||
      !(await backend.updateProfile(
        globalState.profile!.name,
        username.toLowerCase(),
      ))
    ) {
      if (!(await backend.isUsernameFree(username))) {
        dispatch(
          Dialog.actions.showDialog({
              title: StringUtils.texts.UsernameIsExistTitle,
              text: StringUtils.texts.UsernameIsExistText,
              onPress: () => dispatch(Dialog.actions.hideDialog()),
            }
          ),
        );
      } else {
        dispatch(
          Dialog.actions.showDialog({
              title: StringUtils.texts.InvalidUsernameTitle,
              text: StringUtils.texts.InvalidUsernameText,
              onPress: () => dispatch(Dialog.actions.hideDialog()),
            }
          ),
        );
      }

      dispatch(GlobalStore.actions.hideLoading());
      return;
    }

    dispatch(GlobalStore.actions.hideLoading());
    dispatch(GlobalStore.actions.setUpdatingProfile(true));
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

    if (username.toLowerCase() === globalState.profile!.username) {
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
