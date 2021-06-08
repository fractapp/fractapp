import React, {useState, useContext} from 'react';
import renderer from 'react-test-renderer';
import {Settings} from 'screens/Settings';
import GlobalStore from 'storage/Global';
import Keychain from 'react-native-keychain';
import {fireEvent, render} from '@testing-library/react-native';
import {Linking} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import StringUtils from 'utils/string';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
  useState: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));
jest.mock('utils/backend', () => ({
  getImgUrl: jest.fn(() => 'uri'),
}));
jest.mock('react-native-keychain', () => ({
  getSupportedBiometryType: jest.fn(),
}));
useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view (disable passcode)', () => {
  const state = GlobalStore.initialState();
  useContext.mockReturnValueOnce({
    state: state,
    dispatch: jest.fn(),
  });

  Keychain.getSupportedBiometryType.mockReturnValue(null);
  const tree = renderer
    .create(<Settings navigation={null} route={{params: {}}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test view (enable passcode)', () => {
  const state = GlobalStore.initialState();
  state.authInfo.isPasscode = true;
  state.authInfo.isBiometry = true;
  useContext.mockReturnValueOnce({
    state: state,
    dispatch: jest.fn(),
  });

  Keychain.getSupportedBiometryType.mockReturnValue('fingerprint');
  const tree = renderer
    .create(<Settings navigation={null} route={{params: {}}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test view (with user)', () => {
  const state = GlobalStore.initialState();
  state.profile = {
    id: 'id',
    name: 'name',
    username: 'username',
    phoneNumber: 'phoneNumber',
    email: 'email',
    isMigratory: false,
    avatarExt: 'png',
    lastUpdate: 123123,
  };
  useContext.mockReturnValueOnce({
    state: state,
    dispatch: jest.fn(),
  });

  Keychain.getSupportedBiometryType.mockReturnValue(null);
  const tree = renderer
    .create(<Settings navigation={null} route={{params: {}}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click', async () => {
  const nav = jest.fn();
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: jest.fn(),
  });

  Keychain.getSupportedBiometryType.mockReturnValue(null);
  const component = render(
    <Settings navigation={{navigate: nav}} route={{params: {}}} />,
  );

  await fireEvent.press(component.getByTestId('avatarBtn'));
  expect(nav).toBeCalledWith('Connecting');

  await fireEvent.press(
    component.getByText(StringUtils.texts.settings.editProfile),
  );
  expect(nav).toBeCalledWith('Connecting');

  await fireEvent.press(component.getByText(StringUtils.texts.settings.backup));
  expect(nav).toBeCalledWith('Backup');

  await fireEvent.press(
    component.getByText(StringUtils.texts.settings.enablePasscode),
  );
  expect(nav).toBeCalledWith('NewPassCode');

  await fireEvent.press(component.getByText('Twitter'));
  expect(Linking.openURL).toBeCalledWith('https://twitter.com/wfractapp');

  await fireEvent.press(component.getByText('Telegram'));
  expect(Linking.openURL).toBeCalledWith('https://t.me/fractapp');

  /*await fireEvent.press(component.getByText('FAQ'));
  expect(Linking.openURL).toBeCalledWith(
    'https://medium.com/fractapp/fractapp-faq-4e76810c0564',
  );*/

  await fireEvent.press(component.getByText(StringUtils.texts.settings.help));
  expect(Linking.openURL).toBeCalledWith('mailto:support@fractapp.com');

  await fireEvent.press(
    component.getByText(StringUtils.texts.settings.aboutUs),
  );
  expect(Linking.openURL).toBeCalledWith('https://fractapp.com');
});

it('Test click (with profile)', async () => {
  const nav = jest.fn();
  const state = GlobalStore.initialState();
  state.isRegistered = true;
  state.authInfo.isPasscode = true;
  state.authInfo.isBiometry = true;

  useContext.mockReturnValueOnce({
    state: state,
    dispatch: jest.fn(),
  });

  Keychain.getSupportedBiometryType.mockReturnValue('fingerprint');
  const component = render(
    <Settings
      navigation={{navigate: nav}}
      route={{name: 'name', route: 'route', key: 'screenKey', params: {}}}
    />,
  );

  await fireEvent.press(component.getByTestId('avatarBtn'));
  expect(nav).toBeCalledWith('EditProfile');

  await fireEvent.press(
    component.getByText(StringUtils.texts.settings.editProfile),
  );
  expect(nav).toBeCalledWith('EditProfile');

  await fireEvent.press(component.getByText(StringUtils.texts.settings.backup));
  expect(nav).toBeCalledWith('VerifyPassCode', {
    isVerify: true,
    returnScreen: 'name',
    action: 'Backup',
    screenKey: 'screenKey',
  });

  await fireEvent.press(
    component.getByText(StringUtils.texts.settings.disablePasscode),
  );
  expect(nav).toBeCalledWith('VerifyPassCode', {
    isDisablePasscode: true,
  });

  await fireEvent.press(
    component.getByText(StringUtils.texts.settings.disableBiometry),
  );
  expect(nav).toBeCalledWith('VerifyPassCode', {
    isChangeBiometry: true,
  });
});

it('Test use effect', async () => {
  const nav = jest.fn();
  const navDispatch = jest.fn();
  const state = GlobalStore.initialState();
  state.isRegistered = true;
  state.authInfo.isPasscode = true;
  state.authInfo.isBiometry = true;

  useContext.mockReturnValueOnce({
    state: state,
    dispatch: jest.fn(),
  });

  const component = await render(
    <Settings
      navigation={{navigate: nav, dispatch: navDispatch}}
      route={{
        key: 'screenKey',
        params: {isSuccessUnlock: true, action: 'action'},
      }}
    />,
  );
  expect(nav).toBeCalledWith('action');
  expect(navDispatch).toBeCalledWith({
    ...CommonActions.setParams({isSuccessUnlock: false}),
    source: 'screenKey',
  });
});
