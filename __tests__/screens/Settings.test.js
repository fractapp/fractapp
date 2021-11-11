import React, {useState, useContext} from 'react';
import renderer from 'react-test-renderer';
import {Settings} from 'screens/Settings';
import {fireEvent, render} from '@testing-library/react-native';
import {Linking} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import StringUtils from 'utils/string';
import Store from 'storage/Store';
import { useSelector } from 'react-redux';
import FingerprintScanner from 'react-native-fingerprint-scanner';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));
jest.mock('utils/fractappClient', () => ({
  getImgUrl: jest.fn(() => 'uri'),
}));
jest.mock('react-native-fingerprint-scanner', () => ({
    isSensorAvailable: jest.fn(),
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));


FingerprintScanner.isSensorAvailable.mockReturnValue();
useState.mockImplementation((init) => [true, jest.fn()]);
it('Test view (disable passcode)', () => {
  let store = Store.initValues();
  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const tree = renderer
    .create(<Settings navigation={null} route={{params: {}}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test view (enable passcode)', () => {
  let store = Store.initValues();
  store.global.authInfo.hasPasscode = true;
  store.global.authInfo.hasBiometry = true;

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const tree = renderer
    .create(<Settings navigation={null} route={{params: {}}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test view (with user)', () => {
  let store = Store.initValues();
  store.global.profile =  {
    id: 'myProfile',
    name: 'name',
    username: 'username',
    phoneNumber: 'phoneNumber',
    email: 'email',
    avatarExt: 'png',
    lastUpdate: 100,
  };
  store.global.isRegisteredInFractapp = true;

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const tree = renderer
    .create(<Settings navigation={null} route={{params: {}}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click', async () => {
  const nav = jest.fn();
  let store = Store.initValues();

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

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

  let store = Store.initValues();
  store.global.isRegisteredInFractapp = true;
  store.global.authInfo.hasPasscode = true;
  store.global.authInfo.hasBiometry = true;

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

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

  let store = Store.initValues();
  store.global.isRegisteredInFractapp = true;
  store.global.authInfo.hasPasscode = true;
  store.global.authInfo.hasBiometry = true;

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  await render(
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
