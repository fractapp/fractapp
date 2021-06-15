import React, {useState, useContext} from 'react';
import renderer from 'react-test-renderer';
import {EditProfile} from 'screens/EditProfile';
import GlobalStore from 'storage/Global';
import {fireEvent, render} from '@testing-library/react-native';
import {launchImageLibrary} from 'react-native-image-picker/src/index';
import backend from 'utils/backend';
import StringUtils from 'utils/string';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useContext: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));
jest.mock('utils/backend', () => ({
  getImgUrl: jest.fn(() => 'uri'),
  uploadAvatar: jest.fn(),
}));
jest.mock('react-native-image-picker/src/index', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));


useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view (empty)', () => {
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: jest.fn(),
  });
  const tree = renderer.create(<EditProfile navigation={null} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test view (full)', () => {
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

  const tree = renderer.create(<EditProfile navigation={null} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test clicks', () => {
  const state = GlobalStore.initialState();
  const nav = jest.fn();
  state.profile = {
    id: 'id',
    name: 'name',
    username: 'username',
    phoneNumber: '',
    email: '',
    isMigratory: false,
    avatarExt: 'png',
    lastUpdate: 123123,
  };
  useContext.mockReturnValueOnce({
    state: state,
    dispatch: jest.fn(),
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
  const state = GlobalStore.initialState();
  const nav = jest.fn();
  const dispatch = jest.fn();

  state.profile = {
    id: 'id',
    name: 'name',
    username: 'username',
    phoneNumber: '',
    email: '',
    isMigratory: false,
    avatarExt: 'png',
    lastUpdate: 123123,
  };
  useContext.mockReturnValueOnce({
    state: state,
    dispatch: dispatch,
  });

  const component = render(<EditProfile navigation={{navigate: nav}} />);
  await fireEvent.press(component.getByTestId('editAvatarBtn'));

  expect(launchImageLibrary.mock.calls[0][0]).toStrictEqual({
    mediaType: 'photo',
    includeBase64: true,
    maxWidth: 400,
    maxHeight: 400,
  });

  await launchImageLibrary.mock.calls[0][1]({base64: 'base64', type: 'type'});
  expect(dispatch).toBeCalledWith(GlobalStore.setLoading(true));
  expect(backend.uploadAvatar).toBeCalledWith('base64', 'type');
  expect(dispatch).toBeCalledWith(GlobalStore.setUpdatingProfile(true));
  expect(dispatch).toBeCalledWith(GlobalStore.setLoading(false));
});

it('Test edit avatar (negative)', async () => {
  const state = GlobalStore.initialState();
  const nav = jest.fn();
  const dispatch = jest.fn();

  state.profile = {
    id: 'id',
    name: 'name',
    username: 'username',
    phoneNumber: '',
    email: '',
    isMigratory: false,
    avatarExt: 'png',
    lastUpdate: 123123,
  };
  useContext.mockReturnValueOnce({
    state: state,
    dispatch: dispatch,
  });

  const component = render(<EditProfile navigation={{navigate: nav}} />);
  await fireEvent.press(component.getByTestId('editAvatarBtn'));

  expect(launchImageLibrary.mock.calls[0][0]).toStrictEqual({
    mediaType: 'photo',
    includeBase64: true,
    maxWidth: 400,
    maxHeight: 400,
  });

  await launchImageLibrary.mock.calls[0][1]({base64: undefined, type: 'type'});
  expect(dispatch).not.toBeCalledWith(GlobalStore.setLoading(true));
});

it('Test clicks (negative)', () => {
  const state = GlobalStore.initialState();
  const nav = jest.fn();
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

  const component = render(<EditProfile navigation={{navigate: nav}} />);
  fireEvent.press(component.getByText(StringUtils.texts.edit.profile.phoneTitle));
  expect(nav).not.toBeCalledWith('EditPhoneNumber');

  fireEvent.press(component.getByText(StringUtils.texts.edit.profile.emailTitle));
  expect(nav).not.toBeCalledWith('EditEmail');
});
