import React, {useContext, useState} from 'react';
import renderer from 'react-test-renderer';
import {EditUsername} from 'screens/EditUsername';
import DialogStore from 'storage/Dialog';
import {fireEvent, render} from '@testing-library/react-native';
import BackendApi from 'utils/backend';
import GlobalStore from 'storage/Global';
import Dialog from 'storage/Dialog';

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
  updateProfile: jest.fn(),
  setUpdatingProfile: jest.fn(),
  isUsernameFree: jest.fn(),
}));

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view', () => {
  const globalState = GlobalStore.initialState();
  globalState.profile = {
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
    state: globalState,
    dispatch: jest.fn(),
  });
  useContext.mockReturnValueOnce({
    state: DialogStore.initialState(),
    dispatch: jest.fn(),
  });

  const tree = renderer
    .create(<EditUsername navigation={{setOptions: jest.fn()}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click success', async () => {
  const dialogMock = jest.fn();
  const globalMock = jest.fn();

  const navigate = jest.fn();
  const goBack = jest.fn();
  const setOptions = jest.fn();

  const globalState = GlobalStore.initialState();
  globalState.profile = {
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
    state: globalState,
    dispatch: globalMock,
  });
  useContext.mockReturnValueOnce({
    state: DialogStore.initialState(),
    dispatch: dialogMock,
  });

  const newName = 'newUserName';
  useState.mockImplementationOnce((init) => [newName, jest.fn()]);

  const setUsernameExist = jest.fn();
  useState.mockImplementationOnce((init) => [init, setUsernameExist]);
  BackendApi.isUsernameFree.mockReturnValueOnce(true);
  BackendApi.isUsernameFree.mockReturnValueOnce(true);
  BackendApi.updateProfile.mockReturnValueOnce(true);

  const component = render(
    <EditUsername
      navigation={{navigate: navigate, goBack: goBack, setOptions: setOptions}}
    />,
  );

  const successBtn = render(setOptions.mock.calls[0][0].headerRight());
  await fireEvent.press(successBtn.getByTestId('successBtn'));
  expect(BackendApi.updateProfile).toBeCalledWith(
    globalState.profile.name,
    newName.toLowerCase(),
  );

  expect(globalMock).toBeCalledWith(GlobalStore.setLoading(true));
  expect(globalMock).toBeCalledWith(GlobalStore.setUpdatingProfile(true));
  expect(goBack).toBeCalled();
});

it('Test click success with invalid name', async () => {
  const dialogMock = jest.fn();
  const globalMock = jest.fn();

  const navigate = jest.fn();
  const goBack = jest.fn();
  const setOptions = jest.fn();

  const globalState = GlobalStore.initialState();
  globalState.profile = {
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
    state: globalState,
    dispatch: globalMock,
  });
  useContext.mockReturnValueOnce({
    state: DialogStore.initialState(),
    dispatch: dialogMock,
  });

  const newName = 'invalidName@@@<><?';
  useState.mockImplementationOnce((init) => [newName, jest.fn()]);

  const setUsernameExist = jest.fn();
  useState.mockImplementationOnce((init) => [init, setUsernameExist]);
  BackendApi.isUsernameFree.mockReturnValueOnce(true);
  BackendApi.updateProfile.mockReturnValueOnce(true);

  const component = render(
    <EditUsername
      navigation={{navigate: navigate, goBack: goBack, setOptions: setOptions}}
    />,
  );

  const successBtn = render(setOptions.mock.calls[0][0].headerRight());
  await fireEvent.press(successBtn.getByTestId('successBtn'));

  expect(dialogMock.mock.calls[0][0]).toMatchSnapshot();

  dialogMock.mock.calls[0][0].onPress();
  expect(dialogMock).toBeCalledWith(Dialog.close());
  expect(globalMock).toBeCalledWith(GlobalStore.setLoading(false));
});

it('Test click success with name is not free', async () => {
  const dialogMock = jest.fn();
  const globalMock = jest.fn();

  const navigate = jest.fn();
  const goBack = jest.fn();
  const setOptions = jest.fn();

  const globalState = GlobalStore.initialState();
  globalState.profile = {
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
    state: globalState,
    dispatch: globalMock,
  });
  useContext.mockReturnValueOnce({
    state: DialogStore.initialState(),
    dispatch: dialogMock,
  });

  const newName = 'invalidName';
  useState.mockImplementationOnce((init) => [newName, jest.fn()]);

  const setUsernameExist = jest.fn();
  useState.mockImplementationOnce((init) => [init, setUsernameExist]);
  BackendApi.isUsernameFree.mockReturnValueOnce(false);
  BackendApi.isUsernameFree.mockReturnValueOnce(false);

  const component = render(
    <EditUsername
      navigation={{navigate: navigate, goBack: goBack, setOptions: setOptions}}
    />,
  );

  const successBtn = render(setOptions.mock.calls[0][0].headerRight());
  await fireEvent.press(successBtn.getByTestId('successBtn'));

  expect(dialogMock.mock.calls[0][0]).toMatchSnapshot();

  dialogMock.mock.calls[0][0].onPress();
  expect(dialogMock).toBeCalledWith(Dialog.close());
});
