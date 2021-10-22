import React, {useState, useContext} from 'react';
import renderer from 'react-test-renderer';
import {EditProfile} from 'screens/EditProfile';
import GlobalStore from 'storage/Global';
import {fireEvent, render} from '@testing-library/react-native';
import {launchImageLibrary} from 'react-native-image-picker/src/index';
import backend from 'utils/api';
import StringUtils from 'utils/string';
import { useDispatch, useSelector } from 'react-redux';
import Store from 'storage/Store';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));
jest.mock('utils/api', () => ({
  getImgUrl: jest.fn(() => 'uri'),
  uploadAvatar: jest.fn(),
}));
jest.mock('react-native-image-picker/src/index', () => ({
  launchImageLibrary: jest.fn(),
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

it('Test view (empty)', () => {
  const store = Store.initValues();
  store.global.profile =  {
    id: 'myProfile',
    name: '',
    username: '',
    phoneNumber: '',
    email: '',
    avatarExt: 'png',
    lastUpdate: 100,
  };

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const tree = renderer.create(<EditProfile navigation={null} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test view (full)', () => {
  const store = Store.initValues();
  store.global.profile =  {
    id: 'myProfile',
    name: 'name',
    username: 'username',
    phoneNumber: 'phoneNumber',
    email: 'email',
    avatarExt: 'png',
    lastUpdate: 100,
  };

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const tree = renderer.create(<EditProfile navigation={null} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test clicks', () => {
  const nav = jest.fn();
  const store = Store.initValues();
  store.global.profile =  {
    id: 'myProfile',
    name: 'name',
    username: 'username',
    phoneNumber: '',
    email: '',
    avatarExt: '',
    lastUpdate: 100,
  };

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const component = render(<EditProfile navigation={{navigate: nav}} />);
  fireEvent.press(component.getByText('name'));
  expect(nav).toBeCalledWith('EditName');

  fireEvent.press(component.getByText('@username'));
  expect(nav).toBeCalledWith('EditUsername');

  fireEvent.press(component.getByText(StringUtils.texts.edit.profile.phoneTitle));
  expect(nav).toBeCalledWith('EditPhoneNumber');

  fireEvent.press(component.getByText(StringUtils.texts.edit.profile.emailTitle));
  expect(nav).toBeCalledWith('EditEmail');
});

it('Test edit avatar', async () => {
  const nav = jest.fn();
  const store = Store.initValues();
  store.global.profile =  {
    id: 'myProfile',
    name: 'name',
    username: 'username',
    phoneNumber: 'phoneNumber',
    email: 'email',
    avatarExt: 'png',
    lastUpdate: 100,
  };

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const component = render(<EditProfile navigation={{navigate: nav}} />);
  await fireEvent.press(component.getByTestId('editAvatarBtn'));

  expect(launchImageLibrary.mock.calls[0][0]).toStrictEqual({
    mediaType: 'photo',
    includeBase64: true,
    maxWidth: 400,
    maxHeight: 400,
  });

  await launchImageLibrary.mock.calls[0][1]({assets: [{base64: 'base64', type: 'type'}]});
  expect(dispatch).toBeCalledWith(GlobalStore.actions.showLoading());
  expect(backend.uploadAvatar).toBeCalledWith('base64', 'type');
  expect(dispatch).toBeCalledWith(GlobalStore.actions.setUpdatingProfile(true));
  expect(dispatch).toBeCalledWith(GlobalStore.actions.hideLoading());
});

it('Test edit avatar (negative)', async () => {
  const nav = jest.fn();

  const store = Store.initValues();
  store.global.profile =  {
    id: 'myProfile',
    name: 'name',
    username: 'username',
    phoneNumber: 'phoneNumber',
    email: 'email',
    avatarExt: 'png',
    lastUpdate: 100,
  };

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const component = render(<EditProfile navigation={{navigate: nav}} />);
  await fireEvent.press(component.getByTestId('editAvatarBtn'));

  expect(launchImageLibrary.mock.calls[0][0]).toStrictEqual({
    mediaType: 'photo',
    includeBase64: true,
    maxWidth: 400,
    maxHeight: 400,
  });

  await launchImageLibrary.mock.calls[0][1]({assets: [{base64: undefined, type: 'type'}]});
  expect(dispatch).toBeCalledWith(GlobalStore.actions.showLoading());
});

it('Test clicks (negative)', () => {
  const nav = jest.fn();

  const store = Store.initValues();
  store.global.profile =  {
    id: 'myProfile',
    name: 'name',
    username: 'username',
    phoneNumber: 'phoneNumber',
    email: 'email',
    avatarExt: 'png',
    lastUpdate: 100,
  };

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const component = render(<EditProfile navigation={{navigate: nav}} />);
  fireEvent.press(component.getByText(StringUtils.texts.edit.profile.phoneTitle));
  expect(nav).not.toBeCalledWith('EditPhoneNumber');

  fireEvent.press(component.getByText(StringUtils.texts.edit.profile.emailTitle));
  expect(nav).not.toBeCalledWith('EditEmail');
});
