import React, {useContext, useState} from 'react';
import renderer from 'react-test-renderer';
import {EditUsername} from 'screens/EditUsername';
import DialogStore from 'storage/Dialog';
import {fireEvent, render} from '@testing-library/react-native';
import FractappClient from 'utils/fractappClient';
import GlobalStore from 'storage/Global';
import Dialog from 'storage/Dialog';
import { useDispatch, useSelector } from 'react-redux';
import Store from 'storage/Store';
import StringUtils from 'utils/string';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));
jest.mock('utils/fractappClient', () => ({
  updateProfile: jest.fn(),
  setUpdatingProfile: jest.fn(),
  isUsernameFree: jest.fn(),
}));
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));


const dispatch = jest.fn();
useDispatch.mockReturnValue(dispatch);
useState.mockImplementation((init) => [init, jest.fn()]);

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

it('Test view', () => {
  const tree = renderer
    .create(<EditUsername navigation={{setOptions: jest.fn()}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click success', async () => {
  const navigate = jest.fn();
  const goBack = jest.fn();
  const setOptions = jest.fn();

  const newName = 'newUserName';
  useState.mockImplementationOnce((init) => [newName, jest.fn()]);

  const setUsernameExist = jest.fn();
  useState.mockImplementationOnce((init) => [init, setUsernameExist]);
  FractappClient.isUsernameFree.mockReturnValueOnce(true);
  FractappClient.isUsernameFree.mockReturnValueOnce(true);
  FractappClient.updateProfile.mockReturnValueOnce(true);

  render(
    <EditUsername
      navigation={{navigate: navigate, goBack: goBack, setOptions: setOptions}}
    />,
  );

  const successBtn = render(setOptions.mock.calls[0][0].headerRight());
  await fireEvent.press(successBtn.getByTestId('successBtn'));
  expect(FractappClient.updateProfile).toBeCalledWith(
    store.global.profile.name,
    newName.toLowerCase(),
  );

  expect(dispatch).toBeCalledWith(GlobalStore.actions.showLoading());
  expect(dispatch).toBeCalledWith(GlobalStore.actions.setUpdatingProfile(true));
  expect(goBack).toBeCalled();
});

it('Test click success with invalid name', async () => {
  const navigate = jest.fn();
  const goBack = jest.fn();
  const setOptions = jest.fn();

  const newName = 'invalidName@@@<><?';
  useState.mockImplementationOnce((init) => [newName, jest.fn()]);

  const setUsernameExist = jest.fn();
  useState.mockImplementationOnce((init) => [init, setUsernameExist]);
  FractappClient.isUsernameFree.mockReturnValueOnce(true);
  FractappClient.updateProfile.mockReturnValueOnce(true);

  render(
    <EditUsername
      navigation={{navigate: navigate, goBack: goBack, setOptions: setOptions}}
    />,
  );

  const successBtn = render(setOptions.mock.calls[0][0].headerRight());
  await fireEvent.press(successBtn.getByTestId('successBtn'));

  expect(dispatch).toBeCalledWith(
    Dialog.actions.showDialog({
        title: StringUtils.texts.InvalidUsernameTitle,
        text: StringUtils.texts.InvalidUsernameText,
      }
    )
  );

  expect(dispatch).toBeCalledWith(GlobalStore.actions.hideLoading());
});

it('Test click success with name is not free', async () => {
  const navigate = jest.fn();
  const goBack = jest.fn();
  const setOptions = jest.fn();

  const newName = 'invalidName';
  useState.mockImplementationOnce((init) => [newName, jest.fn()]);

  const setUsernameExist = jest.fn();
  useState.mockImplementationOnce((init) => [init, setUsernameExist]);
  FractappClient.isUsernameFree.mockReturnValueOnce(false);

  render(
    <EditUsername
      navigation={{navigate: navigate, goBack: goBack, setOptions: setOptions}}
    />,
  );

  const successBtn = render(setOptions.mock.calls[0][0].headerRight());
  await fireEvent.press(successBtn.getByTestId('successBtn'));

  expect(dispatch).toBeCalledWith(
    Dialog.actions.showDialog({
        title: StringUtils.texts.UsernameIsExistTitle,
        text: StringUtils.texts.UsernameIsExistText,
      }
    )
  );

  expect(dispatch).toBeCalledWith(GlobalStore.actions.hideLoading());
});
