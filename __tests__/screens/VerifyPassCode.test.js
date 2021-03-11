import React, {useContext, useState} from 'react';
import renderer from 'react-test-renderer';
import {VerifyPassCode} from 'screens/VerifyPassCode';
import {fireEvent, render} from '@testing-library/react-native';
import DB from 'storage/DB';
import PasscodeUtil from 'utils/passcode';
import GlobalStore from 'storage/Global';
import {CommonActions} from '@react-navigation/native';
import {showMessage} from 'react-native-flash-message';

jest.mock('storage/DB', () => ({
  getPasscode: jest.fn(),
  getPasscodeHash: jest.fn(),
  getSalt: jest.fn(),
  disablePasscode: jest.fn(),
  enablePasscode: jest.fn(),
}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useContext: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));
jest.mock('react-native-flash-message', () => ({
  showMessage: jest.fn(),
}));
jest.mock('components/PassCode', () => ({
  PassCode: ({isBiometry, description, onSubmit}) => {
    const r = require('react-native');
    return (
      <r.View>
        <r.TouchableHighlight
          testID={'btnSubmit'}
          onPress={() => onSubmit([1, 1, 1, 1, 1, 1])}>
          <r.Text>mock</r.Text>
        </r.TouchableHighlight>
      </r.View>
    );
  },
}));
jest.mock('utils/passcode', () => ({
  hash: jest.fn(),
}));

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view', () => {
  const dispatch = jest.fn();
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: dispatch,
  });
  const tree = renderer
    .create(<VerifyPassCode navigation={null} route={{params: {}}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test isVerify', async () => {
  const dispatch = jest.fn();
  const navDispatch = jest.fn();
  const goBack = jest.fn();

  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: dispatch,
  });
  DB.getPasscodeHash.mockReturnValueOnce('hash');
  DB.getSalt.mockReturnValueOnce('salt');
  PasscodeUtil.hash.mockReturnValueOnce('hash');

  const component = render(
    <VerifyPassCode
      navigation={{
        dispatch: navDispatch,
        goBack: goBack,
      }}
      route={{
        params: {
          isVerify: true,
          action: 'action',
          screenKey: 'screenKey',
        },
      }}
    />,
  );

  await fireEvent.press(component.getByTestId('btnSubmit'));
  expect(dispatch).toBeCalledWith(GlobalStore.setLoading(true));
  expect(dispatch).toBeCalledWith(GlobalStore.setLoading(false));
  expect(navDispatch).toBeCalledWith({
    ...CommonActions.setParams({
      isSuccessUnlock: true,
      action: 'action',
    }),
    source: 'screenKey',
  });
  expect(goBack).toBeCalled();
});

it('Test isDisablePasscode', async () => {
  const dispatch = jest.fn();
  const navDispatch = jest.fn();
  const goBack = jest.fn();

  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: dispatch,
  });
  DB.getPasscodeHash.mockReturnValueOnce('hash');
  DB.getSalt.mockReturnValueOnce('salt');
  PasscodeUtil.hash.mockReturnValueOnce('hash');

  const component = render(
    <VerifyPassCode
      navigation={{
        dispatch: navDispatch,
        goBack: goBack,
      }}
      route={{
        params: {
          isDisablePasscode: true,
        },
      }}
    />,
  );

  await fireEvent.press(component.getByTestId('btnSubmit'));
  expect(dispatch).toBeCalledWith(GlobalStore.setLoading(true));
  expect(dispatch).toBeCalledWith(GlobalStore.disablePasscode());
  expect(dispatch).toBeCalledWith(GlobalStore.setLoading(false));
  expect(goBack).toBeCalled();
});

it('Test isChangeBiometry (isBiometry=true)', async () => {
  const dispatch = jest.fn();
  const navDispatch = jest.fn();
  const goBack = jest.fn();

  const state = GlobalStore.initialState();
  state.authInfo.isBiometry = true;
  useContext.mockReturnValueOnce({
    state: state,
    dispatch: dispatch,
  });
  DB.getPasscodeHash.mockReturnValueOnce('hash');
  DB.getSalt.mockReturnValueOnce('salt');
  PasscodeUtil.hash.mockReturnValueOnce('hash');

  const component = render(
    <VerifyPassCode
      navigation={{
        dispatch: navDispatch,
        goBack: goBack,
      }}
      route={{
        params: {
          isChangeBiometry: true,
        },
      }}
    />,
  );

  await fireEvent.press(component.getByTestId('btnSubmit'));
  expect(dispatch).toBeCalledWith(GlobalStore.setLoading(true));
  expect(DB.disablePasscode).toBeCalled();
  expect(DB.enablePasscode).toBeCalledWith('111111', false);
  expect(dispatch).toBeCalledWith(GlobalStore.disableBiometry());
  expect(dispatch).toBeCalledWith(GlobalStore.setLoading(false));
  expect(goBack).toBeCalled();
});

it('Test isChangeBiometry (isBiometry=false)', async () => {
  const dispatch = jest.fn();
  const navDispatch = jest.fn();
  const goBack = jest.fn();

  const state = GlobalStore.initialState();
  state.authInfo.isBiometry = false;
  useContext.mockReturnValueOnce({
    state: state,
    dispatch: dispatch,
  });
  DB.getPasscodeHash.mockReturnValueOnce('hash');
  DB.getSalt.mockReturnValueOnce('salt');
  PasscodeUtil.hash.mockReturnValueOnce('hash');

  const component = render(
    <VerifyPassCode
      navigation={{
        dispatch: navDispatch,
        goBack: goBack,
      }}
      route={{
        params: {
          isChangeBiometry: true,
        },
      }}
    />,
  );

  await fireEvent.press(component.getByTestId('btnSubmit'));
  expect(dispatch).toBeCalledWith(GlobalStore.setLoading(true));
  expect(DB.disablePasscode).toBeCalled();
  expect(DB.enablePasscode).toBeCalledWith('111111', true);
  expect(dispatch).toBeCalledWith(GlobalStore.enableBiometry());
  expect(dispatch).toBeCalledWith(GlobalStore.setLoading(false));
  expect(goBack).toBeCalled();
});

it('Test invalid passcode', async () => {
  const dispatch = jest.fn();
  const navDispatch = jest.fn();
  const goBack = jest.fn();

  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: dispatch,
  });
  DB.getPasscodeHash.mockReturnValueOnce('hash1');
  DB.getSalt.mockReturnValueOnce('salt');
  PasscodeUtil.hash.mockReturnValueOnce('hash2');

  const component = render(
    <VerifyPassCode
      navigation={{
        dispatch: navDispatch,
        goBack: goBack,
      }}
      route={{
        params: {
          isChangeBiometry: true,
        },
      }}
    />,
  );

  await fireEvent.press(component.getByTestId('btnSubmit'));
  expect(dispatch).toBeCalledWith(GlobalStore.setLoading(true));
  expect(dispatch).toBeCalledWith(GlobalStore.setLoading(false));
  expect(showMessage).toBeCalledWith({
    message: 'Incorrect passcode',
    type: 'danger',
    icon: 'warning',
  });
});
