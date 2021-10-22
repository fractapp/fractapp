import React, {useContext, useState} from 'react';
import renderer from 'react-test-renderer';
import {VerifyPassCode} from 'screens/VerifyPassCode';
import {fireEvent, render} from '@testing-library/react-native';
import DB from 'storage/DB';
import PasscodeUtil from 'utils/passcode';
import GlobalStore from 'storage/Global';
import {CommonActions} from '@react-navigation/native';
import {showMessage} from 'react-native-flash-message';
import { useDispatch, useSelector } from 'react-redux';
import Store from 'storage/Store';
import StringUtils from 'utils/string';

jest.mock('storage/DB', () => ({
  getPasscode: jest.fn(),
  getPasscodeHash: jest.fn(),
  getSalt: jest.fn(),
  disablePasscode: jest.fn(),
  enablePasscode: jest.fn(),
  changeBiometry: jest.fn(),
}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
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
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

useState.mockImplementation((init) => [init, jest.fn()]);

const dispatch = jest.fn();
useDispatch.mockReturnValue(dispatch);

it('Test view', () => {
  const store = Store.initValues();
  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const tree = renderer
    .create(<VerifyPassCode navigation={null} route={{params: {}}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test isVerify', async () => {
  const navDispatch = jest.fn();
  const goBack = jest.fn();

  const store = Store.initValues();
  useSelector.mockImplementation((fn) => {
    return fn(store);
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
  expect(dispatch).toBeCalledWith(GlobalStore.actions.showLoading());
  expect(dispatch).toBeCalledWith(GlobalStore.actions.hideLoading());
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
  const navDispatch = jest.fn();
  const goBack = jest.fn();

  const store = Store.initValues();
  useSelector.mockImplementation((fn) => {
    return fn(store);
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
  expect(dispatch).toBeCalledWith(GlobalStore.actions.showLoading());
  expect(dispatch).toBeCalledWith(GlobalStore.actions.disablePasscode());
  expect(dispatch).toBeCalledWith(GlobalStore.actions.hideLoading());
  expect(goBack).toBeCalled();
});

it('Test isChangeBiometry (isBiometry=true)', async () => {
  const navDispatch = jest.fn();
  const goBack = jest.fn();

  const store = Store.initValues();
  store.global.authInfo.hasBiometry = true;
  useSelector.mockImplementation((fn) => {
    return fn(store);
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
  expect(dispatch).toBeCalledWith(GlobalStore.actions.showLoading());
  expect(DB.changeBiometry).toBeCalledWith(false);
  expect(dispatch).toBeCalledWith(GlobalStore.actions.hideLoading());
  expect(goBack).toBeCalled();
});

it('Test isChangeBiometry (isBiometry=false)', async () => {
  const navDispatch = jest.fn();
  const goBack = jest.fn();

  const store = Store.initValues();
  store.global.authInfo.hasBiometry = false;
  useSelector.mockImplementation((fn) => {
    return fn(store);
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
  expect(dispatch).toBeCalledWith(GlobalStore.actions.showLoading());

  expect(dispatch).toBeCalledWith(GlobalStore.actions.showLoading());
  expect(DB.changeBiometry).toBeCalledWith(true);
  expect(dispatch).toBeCalledWith(GlobalStore.actions.hideLoading());
  expect(goBack).toBeCalled();
});

it('Test invalid passcode', async () => {
  const navDispatch = jest.fn();
  const goBack = jest.fn();

  const store = Store.initValues();
  useSelector.mockImplementation((fn) => {
    return fn(store);
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
  expect(dispatch).toBeCalledWith(GlobalStore.actions.showLoading());
  expect(dispatch).toBeCalledWith(GlobalStore.actions.hideLoading());
  expect(showMessage).toBeCalledWith({
    message: StringUtils.texts.showMsg.incorrectPasscode,
    type: 'danger',
    icon: 'warning',
  });
});
