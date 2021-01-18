import React, {useContext} from 'react';
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

  const isDisablePasscode = route.params?.isDisablePasscode ?? false;
  const isChangeBiometry = route.params?.isChangeBiometry ?? false;

  const onSubmit = async (passcode: Array<number>) => {
    let hash = await DB.getPasscodeHash();
    if (
      hash === PasscodeUtil.hash(passcode.join(''), (await DB.getSalt()) ?? '')
    ) {
      if (isDisablePasscode) {
        globalContext.dispatch(GlobalStore.disablePasscode());
      } else if (isChangeBiometry) {
        await DB.disablePasscode();
        await DB.enablePasscode(
          passcode.join(''),
          !globalContext.state.authInfo.isBiometry,
        );

        globalContext.dispatch(
          globalContext.state.authInfo.isBiometry
            ? GlobalStore.disableBiometry()
            : GlobalStore.enableBiometry(),
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

  return (
    <PassCode
      isBiometry={globalContext.state.authInfo.isBiometry}
      description={'Enter passcode'}
      onSubmit={onSubmit}
    />
  );
};
