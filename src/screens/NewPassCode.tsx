import React, {useContext, useEffect, useState} from 'react';
import {showMessage} from 'react-native-flash-message';
import {PassCode} from 'components';
import DB from 'utils/db';
import Auth from 'storage/Auth';
import AuthStore from 'storage/Auth';

export const NewPassCode = ({navigation}: {navigation: any}) => {
  const authContext = useContext(Auth.Context);

  const [newPasscode, setNewPasscode] = useState<Array<number>>(new Array());
  const [description, setDescription] = useState<string>('Enter new passcode');

  const onSubmit = async (passcode: Array<number>) => {
    if (newPasscode.length == 0) {
      setNewPasscode(passcode);
      setDescription('Confirm new passcode');
    } else {
      let isEquals = true;
      for (let i = 0; i < passcode.length; i++) {
        if (newPasscode[i] != passcode[i]) {
          isEquals = false;
          break;
        }
      }

      if (isEquals) {
        await DB.enablePasscode(passcode.join(''), false);
        authContext.dispatch(AuthStore.setPasscode(true));
        navigation.goBack();
      } else {
        showMessage({
          message: 'Passcode not equals',
          type: 'danger',
          icon: 'warning',
        });
      }
    }
  };

  return (
    <PassCode
      isBiometry={false}
      description={description}
      onSubmit={onSubmit}
    />
  );
};
