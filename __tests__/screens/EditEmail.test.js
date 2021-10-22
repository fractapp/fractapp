import React, {useContext, useState} from 'react';
import {EditEmail} from 'screens/EditEmail';
import {fireEvent, render} from '@testing-library/react-native';
import BackendApi from 'utils/api';
import Dialog from 'storage/Dialog';
import { useDispatch } from 'react-redux';
import StringUtils from 'utils/string';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));
jest.mock('utils/api', () => ({
  sendCode: jest.fn(),
  CodeType: {
    Email: 12,
  },
}));

useState.mockImplementation((init) => [init, jest.fn()]);

const dispatch = jest.fn();
useDispatch.mockReturnValue(dispatch);

it('Test view', () => {
  const tree = render(<EditEmail navigation={{setOptions: jest.fn()}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click success', () => {
  const navigate = jest.fn();
  const setOptions = jest.fn();

  const email = 'test@email.com';

  useState.mockImplementationOnce((init) => [email, jest.fn()]);

  render(
    <EditEmail navigation={{navigate: navigate, setOptions: setOptions}} />,
  );

  const successBtn = render(setOptions.mock.calls[0][0].headerRight());

  fireEvent.press(successBtn.getByTestId('successBtn'));
  expect(BackendApi.sendCode).toBeCalledWith(
    email,
    BackendApi.CodeType.Email
  );
  expect(navigate).toBeCalledWith('ConfirmCode', {
    value: email,
    type: BackendApi.CodeType.Email,
  });
});

it('Test click success with invalid email', () => {
  const navigate = jest.fn();
  const setOptions = jest.fn();

  const email = 'invalidEmail';
  useState.mockImplementationOnce((init) => [email, jest.fn()]);

  render(
    <EditEmail navigation={{ navigate: navigate, setOptions: setOptions }} />,
  );

  const successBtn = render(setOptions.mock.calls[0][0].headerRight());

  fireEvent.press(successBtn.getByTestId('successBtn'));

  expect(dispatch).toBeCalledWith(Dialog.actions.showDialog(
    {
      title: StringUtils.texts.InvalidEmailTitle,
      text: StringUtils.texts.InvalidEmailText,
    })
  );
});
