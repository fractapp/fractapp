import React, {useContext} from 'react';
import {showMessage} from 'react-native-flash-message';
import {PassCode} from 'components/PassCode';
import DB from 'storage/DB';
import PasscodeUtil from 'utils/passcode';
import GlobalStore from 'storage/Global';
import {CommonActions} from '@react-navigation/native';
import StringUtils from 'utils/string';

/**
 * Passcode verification screen
 * @category Screens
 */
export const VerifyPassCode = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const globalContext = useContext(GlobalStore.Context);

  const isVerify: boolean = route.params?.isVerify ?? false;
  const isDisablePasscode: boolean = route.params?.isDisablePasscode ?? false;
  const isChangeBiometry: boolean = route.params?.isChangeBiometry ?? false;

  const action = route.params?.action ?? '';
  const screenKey = route.params?.screenKey ?? '';

  const onSubmit = async (passcode: Array<number>) => {
    globalContext.dispatch(GlobalStore.setLoading(true));

    let hash = await DB.getPasscodeHash();
    if (
      hash === PasscodeUtil.hash(passcode.join(''), (await DB.getSalt()) ?? '')
    ) {
      if (isVerify) {
        globalContext.dispatch(GlobalStore.setLoading(false));

        navigation.dispatch({
          ...CommonActions.setParams({
            isSuccessUnlock: true,
            action: action,
          }),
          source: screenKey,
        });
        navigation.goBack();
        return;
      } else if (isDisablePasscode) {
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

      globalContext.dispatch(GlobalStore.setLoading(false));
      navigation.goBack();
    } else {
      globalContext.dispatch(GlobalStore.setLoading(false));

      showMessage({
        message: StringUtils.texts.showMsg.incorrectPasscode,
        type: 'danger',
        icon: 'warning',
      });
    }
  };

  return (
    <PassCode
      isBiometry={globalContext.state.authInfo.isBiometry}
      description={StringUtils.texts.passCode.verifyDescription}
      onSubmit={onSubmit}
    />
  );
};
