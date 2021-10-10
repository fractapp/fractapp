import React from 'react';
import {showMessage} from 'react-native-flash-message';
import {PassCode} from 'components/PassCode';
import DB from 'storage/DB';
import PasscodeUtil from 'utils/passcode';
import GlobalStore from 'storage/Global';
import {CommonActions} from '@react-navigation/native';
import StringUtils from 'utils/string';
import { useDispatch, useSelector } from 'react-redux';

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
  const dispatch = useDispatch();
  const globalState: GlobalStore.State = useSelector((state: any) => state.global);

  const isVerify: boolean = route.params?.isVerify ?? false;
  const isDisablePasscode: boolean = route.params?.isDisablePasscode ?? false;
  const isChangeBiometry: boolean = route.params?.isChangeBiometry ?? false;

  const action = route.params?.action ?? '';
  const screenKey = route.params?.screenKey ?? '';

  const onSubmit = async (passcode: Array<number>) => {
    dispatch(GlobalStore.actions.showLoading());

    let hash = await DB.getPasscodeHash();
    if (
      hash === PasscodeUtil.hash(passcode.join(''), (await DB.getSalt()) ?? '')
    ) {
      if (isVerify) {
        dispatch(GlobalStore.actions.hideLoading());

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
        dispatch(GlobalStore.actions.disablePasscode());
      } else if (isChangeBiometry) {
        await DB.disablePasscode();
        console.log('reset passcode');
        await DB.enablePasscode(
          passcode.join(''),
          !globalState.authInfo.hasBiometry,
        );

        dispatch(
          globalState.authInfo.hasBiometry
            ? GlobalStore.actions.disableBiometry()
            : GlobalStore.actions.enableBiometry(),
        );
      }

      dispatch(GlobalStore.actions.hideLoading());
      navigation.goBack();
    } else {
      dispatch(GlobalStore.actions.hideLoading());

      showMessage({
        message: StringUtils.texts.showMsg.incorrectPasscode,
        type: 'danger',
        icon: 'warning',
      });
    }
  };

  return (
    <PassCode
      isBiometry={globalState.authInfo.hasBiometry}
      description={StringUtils.texts.passCode.verifyDescription}
      onSubmit={onSubmit}
    />
  );
};
