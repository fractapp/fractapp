import React, {useContext, useState} from 'react';
import renderer from 'react-test-renderer';
import {ConfirmCode} from 'screens/ConfirmCode';
import BackendApi from 'utils/api';
import GlobalStore from 'storage/Global';
import {fireEvent, render} from '@testing-library/react-native';
import Dialog from 'storage/Dialog';
import StringUtils from 'utils/string';
import { useDispatch } from 'react-redux';

jest.mock('storage/DB', () => {});
jest.mock('adaptors/adaptor', () => {});
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));
jest.mock('@polkadot/util-crypto', () => ({
  randomAsHex: jest.fn(),
}));
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));
jest.mock('@polkadot/keyring', () => {});
jest.mock('@polkadot/util', () => {});
jest.mock('@polkadot/keyring/types', () => {});
jest.mock('utils/api', () => ({
  auth: jest.fn(),
  sendCode: jest.fn(),
  CodeType: {
    Email: 12,
    Phone: 13,
  },
  CheckType: {
    Auth: 101,
  },
  CodeLength: 6,
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

jest.useFakeTimers();
useState.mockImplementation((init) => [init, jest.fn()]);

const dispatch = jest.fn();
useDispatch.mockReturnValue(dispatch);

const createStates = (code, locTime) => {
  const setCode = jest.fn();
  const setEditable = jest.fn();
  const setLockTime = jest.fn();
  const setBorderColor = jest.fn();

  useState
    .mockImplementationOnce((init) => [code, setCode])
    .mockImplementationOnce((init) => [init, setEditable])
    .mockImplementationOnce((init) => [locTime, setLockTime])
    .mockImplementationOnce((init) => [init, setBorderColor]);

  return {
    setCode: setCode,
    setEditable: setEditable,
    setLockTime: setLockTime,
    setBorderColor: setBorderColor,
  };
};

it('Test view', () => {
  const tree = renderer
    .create(
      <ConfirmCode
        navigation={null}
        route={{
          params: {
            value: 'email',
            type: BackendApi.CodeType.Phone,
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test with code (not full)', async () => {
  createStates('1', 60);

  const navigate = await jest.fn();
  const tree = renderer
    .create(
      <ConfirmCode
        navigation={{navigate: navigate}}
        route={{
          params: {
            value: 'email',
            type: BackendApi.CodeType.Email,
          },
        }}
      />,
    )
    .toJSON();

  expect(tree).toMatchSnapshot();
});

it('Test with code (full / 200)', async () => {
  const setters = createStates('123123', 60);

  BackendApi.auth.mockReturnValueOnce(200);

  const navigate = jest.fn();
  const reset = jest.fn();
  await render(
    <ConfirmCode
      navigation={{navigate: navigate, reset: reset}}
      route={{
        params: {
          value: 'email',
          type: BackendApi.CodeType.Email,
        },
      }}
    />,
  );

  expect(setters.setEditable).toBeCalledWith(false);
  expect(setters.setBorderColor).toBeCalledWith('#2AB2E2');
  expect(dispatch).toBeCalledWith(
    GlobalStore.actions.showLoading(),
  );
  expect(dispatch).toBeCalledWith(
    GlobalStore.actions.signInFractapp(),
  );
  expect(reset).toBeCalledWith({
    index: 1,
    actions: [navigate('Home'), navigate('EditProfile')],
  });
  expect(dispatch).toBeCalledWith(
    GlobalStore.actions.hideLoading(),
  );
});

it('Test with code (throw)', async () => {
  const setters = createStates('123123', 60);

  BackendApi.auth.mockImplementationOnce(() => {
    throw new Error('error!');
  });

  const navigate = jest.fn();
  const reset = jest.fn();
  const component = await render(
    <ConfirmCode
      navigation={{navigate: navigate, reset: reset}}
      route={{
        params: {
          value: 'email',
          type: BackendApi.CodeType.Email,
        },
      }}
    />,
  );

  expect(setters.setEditable).toBeCalledWith(false);
  expect(setters.setBorderColor).toBeCalledWith('#2AB2E2');
  expect(dispatch).toBeCalledWith(
    GlobalStore.actions.showLoading()
  );
  expect(setters.setCode).toBeCalledWith('');
  expect(setters.setBorderColor).toBeCalledWith('#EA4335');
  expect(setters.setEditable).toBeCalledWith(true);
  expect(dispatch).toBeCalledWith(
    GlobalStore.actions.hideLoading()
  );
});

it('Test with code (full / 400)', async () => {
  const setters = createStates('123123', 60);

  BackendApi.auth.mockReturnValueOnce(400);

  const navigate = jest.fn();
  const reset = jest.fn();
  await render(
    <ConfirmCode
      navigation={{navigate: navigate, reset: reset}}
      route={{
        params: {
          value: 'email',
          type: BackendApi.CodeType.Email,
        },
      }}
    />,
  );

  expect(setters.setEditable).toBeCalledWith(false);
  expect(setters.setBorderColor).toBeCalledWith('#2AB2E2');
  expect(dispatch).toBeCalledWith(
    GlobalStore.actions.showLoading()
  );
  expect(dispatch).toBeCalledWith(
    Dialog.actions.showDialog({
      title: StringUtils.texts.ServiceUnavailableTitle,
      text: '',
    }
  ));

  expect(setters.setCode).toBeCalledWith('');
  expect(setters.setBorderColor).toBeCalledWith('#EA4335');

  expect(setters.setEditable).toBeCalledWith(true);
  expect(dispatch).toBeCalledWith(
    GlobalStore.actions.hideLoading()
  );
});

it('Test with code (full / 403)', async () => {
  const setters = createStates('123123', 60);

  BackendApi.auth.mockReturnValueOnce(403);

  const navigate = jest.fn();
  const reset = jest.fn();
  const goBack = jest.fn();
  await render(
    <ConfirmCode
      navigation={{navigate: navigate, reset: reset, goBack}}
      route={{
        params: {
          value: 'email',
          type: BackendApi.CodeType.Email,
        },
      }}
    />,
  );

  expect(setters.setEditable).toBeCalledWith(false);
  expect(setters.setBorderColor).toBeCalledWith('#2AB2E2');
  expect(dispatch).toBeCalledWith(
    GlobalStore.actions.showLoading()
  );
  expect(goBack).toBeCalled();

  expect(dispatch).toBeCalledWith(
      Dialog.actions.showDialog({
          title: StringUtils.texts.DifferentAddressTitle,
          text: '',
        },
      )
  );

  expect(setters.setCode).toBeCalledWith('');
  expect(setters.setBorderColor).toBeCalledWith('#EA4335');

  expect(setters.setEditable).toBeCalledWith(true);
  expect(dispatch).toBeCalledWith(
    GlobalStore.actions.hideLoading()
  );
});

it('Test with code (full / 404)', async () => {
  const setters = createStates('123123', 60);

  BackendApi.auth.mockReturnValueOnce(404);

  const navigate = jest.fn();
  const reset = jest.fn();
  const goBack = jest.fn();
  await render(
    <ConfirmCode
      navigation={{navigate: navigate, reset: reset, goBack}}
      route={{
        params: {
          value: 'email',
          type: BackendApi.CodeType.Email,
        },
      }}
    />,
  );

  expect(setters.setEditable).toBeCalledWith(false);
  expect(setters.setBorderColor).toBeCalledWith('#2AB2E2');
  expect(dispatch).toBeCalledWith(
    GlobalStore.actions.showLoading()
  );
  expect(setters.setCode).toBeCalledWith('');
  expect(setters.setBorderColor).toBeCalledWith('#EA4335');

  expect(setters.setEditable).toBeCalledWith(true);
  expect(dispatch).toBeCalledWith(
    GlobalStore.actions.hideLoading()
  );
});

it('Test resend (200)', async () => {
  const setters = createStates('', 0);

  BackendApi.sendCode.mockReturnValueOnce(200);

  const navigate = jest.fn();
  const component = await render(
    <ConfirmCode
      navigation={{navigate: navigate}}
      route={{
        params: {
          value: 'email',
          type: BackendApi.CodeType.Email,
        },
      }}
    />,
  );
  await fireEvent.press(component.getByText(StringUtils.texts.ResendTitle));

  expect(setters.setLockTime).toBeCalledWith(60);
  expect(BackendApi.sendCode).toBeCalledWith(
    'email',
    BackendApi.CodeType.Email
  );
});

it('Test resend (400)', async () => {
  const setters = createStates('', 0);

  BackendApi.sendCode.mockReturnValueOnce(400);
  const navigate = jest.fn();
  const component = await render(
    <ConfirmCode
      navigation={{ navigate: navigate }}
      route={{
        params: {
          value: 'email',
          type: BackendApi.CodeType.Email,
        },
      }}
    />,
  );
  await fireEvent.press(component.getByText(StringUtils.texts.ResendTitle));

  expect(setters.setLockTime).toBeCalledWith(60);
  expect(BackendApi.sendCode).toBeCalledWith(
    'email',
    BackendApi.CodeType.Email
  );
  expect(dispatch).toBeCalledWith(
    Dialog.actions.showDialog({
        title: StringUtils.texts.ServiceUnavailableTitle,
        text: '',
      }
    )
  );
});

it('Test resend (404/email)', async () => {
  const setters = createStates('', 0);

  BackendApi.sendCode.mockReturnValueOnce(404);
  const navigate = jest.fn();
  const component = await render(
    <ConfirmCode
      navigation={{navigate: navigate}}
      route={{
        params: {
          value: 'email',
          type: BackendApi.CodeType.Email,
        },
      }}
    />,
  );
  await fireEvent.press(component.getByText(StringUtils.texts.ResendTitle));

  expect(setters.setLockTime).toBeCalledWith(60);
  expect(BackendApi.sendCode).toBeCalledWith(
    'email',
    BackendApi.CodeType.Email
  );
});

it('Test resend (404/phone)', async () => {
  const setters = createStates('', 0);

  BackendApi.sendCode.mockReturnValueOnce(404);
  const navigate = jest.fn();
  const component = await render(
    <ConfirmCode
      navigation={{navigate: navigate}}
      route={{
        params: {
          value: 'phone',
          type: BackendApi.CodeType.Phone,
        },
      }}
    />,
  );
  await fireEvent.press(component.getByText(StringUtils.texts.ResendTitle));

  expect(setters.setLockTime).toBeCalledWith(60);
  expect(BackendApi.sendCode).toBeCalledWith(
    'phone',
    BackendApi.CodeType.Phone
  );
});
