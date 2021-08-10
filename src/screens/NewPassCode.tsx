import React, {useContext, useState} from 'react';
import {showMessage} from 'react-native-flash-message';
import {PassCode} from 'components/PassCode';
import GlobalStore from 'storage/Global';
import StringUtils from 'utils/string';
import { useDispatch } from 'react-redux';

/**
 * Screen with entering new passcode
 * @category Screens
 */
export const NewPassCode = ({navigation}: {navigation: any}) => {
  const dispatch = useDispatch();

  const [newPasscode, setNewPasscode] = useState<Array<number>>([]);
  const [description, setDescription] = useState<string>(
    StringUtils.texts.passCode.newCodeDescription,
  );

  const onSubmit = async (passcode: Array<number>) => {
    if (newPasscode.length === 0) {
      setNewPasscode(passcode);
      setDescription(StringUtils.texts.passCode.confirmNewCodeDescription);
    } else {
      let isEquals = true;
      for (let i = 0; i < passcode.length; i++) {
        if (newPasscode[i] !== passcode[i]) {
          isEquals = false;
          break;
        }
      }

      if (isEquals) {
        dispatch(GlobalStore.actions.enablePasscode(passcode.join('')));
        navigation.goBack();
      } else {
        showMessage({
          message: StringUtils.texts.showMsg.passcodeNotEquals,
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
