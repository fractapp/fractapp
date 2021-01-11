import React, {useContext, useEffect, useState} from 'react';
import {showMessage} from 'react-native-flash-message';
import {PassCode} from 'components';
import DB from 'storage/DB';
import PasscodeUtil from 'utils/passcode';
import GlobalStore from 'storage/Global';

export const VerifyPassCode = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const globalContext = useContext(GlobalStore.Context);

  const [isBiometry, setBiometry] = useState<Boolean>();
  const isDisablePasscode = route.params?.isDisablePasscode ?? false;
  const isChangeBiometry = route.params?.isChangeBiometry ?? false;

  const onSubmit = async (passcode: Array<number>) => {
    let hash = await DB.getPasscodeHash();
    if (
      hash == PasscodeUtil.hash(passcode.join(''), (await DB.getSalt()) ?? '')
    ) {
      if (isDisablePasscode) {
        globalContext.dispatch(GlobalStore.disablePasscode());
      } else if (isChangeBiometry) {
        const isBiometry = await DB.isBiometry();

        globalContext.dispatch(
          isBiometry
            ? GlobalStore.enableBiometry(passcode.join(''))
            : GlobalStore.disableBiometry(passcode.join('')),
        );
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
