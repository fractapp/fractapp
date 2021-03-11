import React, {useContext, useState} from 'react';
import renderer from 'react-test-renderer';
import {EditEmail} from 'screens/EditEmail';
import DialogStore from 'storage/Dialog';
import {fireEvent, render} from '@testing-library/react-native';
import {WalletDetails} from 'screens/WalletDetails';
import BackendApi from 'utils/backend';
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
  sendCode: jest.fn(),
  CodeType: {
    Email: 12,
  },
  CheckType: {
    Auth: 13,
  },
}));

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view', () => {
  const dialogMock = jest.fn();
  useContext.mockReturnValueOnce({
    state: DialogStore.initialState(),
    dispatch: dialogMock,
  });

  const tree = renderer
    .create(<EditEmail navigation={{setOptions: jest.fn()}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click success', () => {
  const dialogMock = jest.fn();
  const navigate = jest.fn();
  const setOptions = jest.fn();

  useContext.mockReturnValueOnce({
    state: DialogStore.initialState(),
    dispatch: dialogMock,
  });
  const email = 'test@email.com';
  useState.mockImplementationOnce((init) => [email, jest.fn()]);

  const component = render(
    <EditEmail navigation={{navigate: navigate, setOptions: setOptions}} />,
  );

  const successBtn = render(setOptions.mock.calls[0][0].headerRight());

  fireEvent.press(successBtn.getByTestId('successBtn'));
  expect(BackendApi.sendCode).toBeCalledWith(
    email,
    BackendApi.CodeType.Email,
    BackendApi.CheckType.Auth,
  );
  expect(navigate).toBeCalledWith('ConfirmCode', {
    value: email,
    type: BackendApi.CodeType.Email,
  });
});

it('Test click success with invalid email', () => {
  const dialogMock = jest.fn();
  const navigate = jest.fn();
  const setOptions = jest.fn();

  useContext.mockReturnValueOnce({
    state: DialogStore.initialState(),
    dispatch: dialogMock,
  });
  const email = 'invalidEmail';
  useState.mockImplementationOnce((init) => [email, jest.fn()]);

  const component = render(
    <EditEmail navigation={{navigate: navigate, setOptions: setOptions}} />,
  );

  const successBtn = render(setOptions.mock.calls[0][0].headerRight());

  fireEvent.press(successBtn.getByTestId('successBtn'));

  expect(dialogMock.mock.calls[0][0]).toMatchSnapshot();

  dialogMock.mock.calls[0][0].onPress();
  expect(dialogMock).toBeCalledWith(Dialog.close());
});
