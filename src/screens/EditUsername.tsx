import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {SuccessButton} from 'components/SuccessButton';
import BackendApi from 'utils/backend';
import Dialog from 'storage/Dialog';
import * as EmailValidator from 'email-validator';
import GlobalStore from 'storage/Global';
import backend from 'utils/backend';

export const EditUsername = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const regExp = new RegExp('[^A-Za-z0-9_-]');
  const globalContext = useContext(GlobalStore.Context);
  const dialogContext = useContext(Dialog.Context);

  const [username, setUsername] = useState<string>(
    globalContext.state.profile.username,
  );
  const [isExist, setUsernameExist] = useState<boolean>(false);

  const onSuccess = async () => {
    if (username.toLowerCase() === globalContext.state.profile.username) {
      navigation.goBack();
      return;
    }

    if (
      regExp.test(username) ||
      !(await backend.isUsernameFree(username)) ||
      !(await backend.updateProfile(globalContext.state.profile.name, username))
    ) {
      dialogContext.dispatch(
        Dialog.open(
          'Invalid username',
          'Please validate and write username again',
          () => dialogContext.dispatch(Dialog.close()),
        ),
      );
      return;
    }

    globalContext.dispatch(GlobalStore.setUpdatingProfile(true));
    navigation.goBack();
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <SuccessButton size={35} onPress={onSuccess} />;
      },
    });

    if (username.toLowerCase() === globalContext.state.profile.username) {
      setUsernameExist(false);
      return;
    }

    if (regExp.test(username)) {
      setUsernameExist(true);
      return;
    }
    backend.isUsernameFree(username).then((exist) => {
      setUsernameExist(!exist);
      return;
    });
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
            placeholder={'Enter username'}
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