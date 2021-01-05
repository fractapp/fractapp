import React, {useContext, useEffect, useState} from 'react';
import {showMessage} from 'react-native-flash-message';
import {PassCode} from 'components';
import DB from 'utils/db';
import PasscodeUtil from 'utils/passcode';
import Auth from 'storage/Auth';
import AuthStore from 'storage/Auth';

export const VerifyPassCode = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const authContext = useContext(Auth.Context);

  const [isBiometry, setBiometry] = useState<Boolean>();
  const isDisablePasscode = route.params?.isDisablePasscode ?? false;
  const isChangeBiometry = route.params?.isChangeBiometry ?? false;

  const onSubmit = async (passcode: Array<number>) => {
    let hash = await DB.getPasscodeHash();
    if (hash == PasscodeUtil.hash(passcode.join(''), await DB.getSalt())) {
      if (isDisablePasscode) {
        await DB.disablePasscode();
        authContext.dispatch(AuthStore.setPasscode(false));
      } else if (isChangeBiometry) {
        const isBiometry = await DB.isBiometry();
        await DB.disablePasscode();
        await DB.enablePasscode(passcode.join(''), !isBiometry);

        authContext.dispatch(AuthStore.setBiometry(!isBiometry));
      }

      navigation.goBack();
    } else {
      showMessage({
        message: 'Incorrect passcode',
        type: 'danger',
        icon: 'warning',
      });
    }
  };

  useEffect(() => {
    (async () => {
      setBiometry(await DB.isBiometry());
    })();
  }, []);

  return (
    <PassCode
      isBiometry={isBiometry}
      description={'Enter passcode'}
      onSubmit={onSubmit}
    />
  );
};
