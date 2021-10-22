import React, {useState} from 'react';
import renderer from 'react-test-renderer';
import {EditName} from 'screens/EditName';
import {fireEvent, render} from '@testing-library/react-native';
import BackendApi from 'utils/api';
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
jest.mock('utils/api', () => ({
  updateProfile: jest.fn(),
  setUpdatingProfile: jest.fn(),
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
    .create(<EditName navigation={{setOptions: jest.fn()}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click success', async () => {
  const navigate = jest.fn();
  const goBack = jest.fn();
  const setOptions = jest.fn();

  const newName = 'newName';
  useState.mockImplementationOnce((init) => [newName, jest.fn()]);

  const setNameIsError = jest.fn();
  useState.mockImplementationOnce((init) => [init, setNameIsError]);
  BackendApi.updateProfile.mockReturnValueOnce(true);

  render(
    <EditName
      navigation={{navigate: navigate, goBack: goBack, setOptions: setOptions}}
    />,
  );
  expect(setNameIsError).toBeCalledWith(false);

  const successBtn = render(setOptions.mock.calls[0][0].headerRight());
  await fireEvent.press(successBtn.getByTestId('successBtn'));
  expect(BackendApi.updateProfile).toBeCalledWith(
    newName,
    store.global.profile.username,
  );

  expect(dispatch).toBeCalledWith(GlobalStore.actions.setUpdatingProfile(true));
  expect(goBack).toBeCalled();
});

it('Test click success with invalid name', async () => {
  const navigate = jest.fn();
  const goBack = jest.fn();
  const setOptions = jest.fn();

  const newName = '@<>123123>';
  useState.mockImplementationOnce((init) => [newName, jest.fn()]);

  const setNameIsError = jest.fn();
  useState.mockImplementationOnce((init) => [init, setNameIsError]);
  BackendApi.updateProfile.mockReturnValueOnce(true);

  render(
    <EditName
      navigation={{navigate: navigate, goBack: goBack, setOptions: setOptions}}
    />,
  );
  expect(setNameIsError).toBeCalledWith(true);

  const successBtn = render(setOptions.mock.calls[0][0].headerRight());
  await fireEvent.press(successBtn.getByTestId('successBtn'));

  expect(dispatch).toBeCalledWith(
    Dialog.actions.showDialog({
        title: StringUtils.texts.InvalidNameTitle,
        text: StringUtils.texts.InvalidNameText,
      }
    )
  );
});
