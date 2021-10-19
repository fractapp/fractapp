import React, {useContext, useState} from 'react';
import renderer from 'react-test-renderer';
import {ConfirmCode} from 'screens/ConfirmCode';
import BackendApi from 'utils/api';
import GlobalStore from 'storage/Global';
import DialogStore from 'storage/Dialog';
import {fireEvent, render} from '@testing-library/react-native';
import Dialog from 'storage/Dialog';
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

const createContexts = () => {
  const dialogDispatch = jest.fn();
  const globalDispatch = jest.fn();
  useContext.mockReturnValueOnce({
    state: DialogStore.initialState(),
    dispatch: dialogDispatch,
  });
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: globalDispatch,
  });

  return {
    dialogDispatch: dialogDispatch,
    globalDispatch: globalDispatch,
  };
};
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
  createContexts();

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
  createContexts();

  const setters = createStates('1', 60);

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
  const dispatchers = createContexts();
  const setters = createStates('123123', 60);

  BackendApi.auth.mockReturnValueOnce(200);

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
  expect(dispatchers.globalDispatch).toBeCalledWith(
    GlobalStore.setLoading(true),
  );
  expect(dispatchers.globalDispatch).toBeCalledWith(
    GlobalStore.signInFractapp(true),
  );
  expect(reset).toBeCalledWith({
    index: 1,
    actions: [navigate('Home'), navigate('EditProfile')],
  });
  expect(dispatchers.globalDispatch).toBeCalledWith(
    GlobalStore.setLoading(false),
  );
});

it('Test with code (throw)', async () => {
  const dispatchers = createContexts();
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
  expect(dispatchers.globalDispatch).toBeCalledWith(
    GlobalStore.setLoading(true),
  );
  expect(setters.setCode).toBeCalledWith('');
  expect(setters.setBorderColor).toBeCalledWith('#EA4335');
  expect(setters.setEditable).toBeCalledWith(true);
  expect(dispatchers.globalDispatch).toBeCalledWith(
    GlobalStore.setLoading(false),
  );
});

it('Test with code (full / 400)', async () => {
  const dispatchers = createContexts();
  const setters = createStates('123123', 60);

  BackendApi.auth.mockReturnValueOnce(400);

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
  expect(dispatchers.globalDispatch).toBeCalledWith(
    GlobalStore.setLoading(true),
  );
  expect(dispatchers.dialogDispatch.mock.calls[0][0]).toMatchSnapshot();
  await dispatchers.dialogDispatch.mock.calls[0][0].onPress();
  expect(dispatchers.dialogDispatch).toBeCalledWith(Dialog.close());

  expect(setters.setCode).toBeCalledWith('');
  expect(setters.setBorderColor).toBeCalledWith('#EA4335');

  expect(setters.setEditable).toBeCalledWith(true);
  expect(dispatchers.globalDispatch).toBeCalledWith(
    GlobalStore.setLoading(false),
  );
});

it('Test with code (full / 403)', async () => {
  const dispatchers = createContexts();
  const setters = createStates('123123', 60);

  BackendApi.auth.mockReturnValueOnce(403);

  const navigate = jest.fn();
  const reset = jest.fn();
  const goBack = jest.fn();
  const component = await render(
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
  expect(dispatchers.globalDispatch).toBeCalledWith(
    GlobalStore.setLoading(true),
  );
  expect(goBack).toBeCalled();
  expect(dispatchers.dialogDispatch.mock.calls[0][0]).toMatchSnapshot();
  await dispatchers.dialogDispatch.mock.calls[0][0].onPress();
  expect(dispatchers.dialogDispatch).toBeCalledWith(Dialog.close());

  expect(setters.setCode).toBeCalledWith('');
  expect(setters.setBorderColor).toBeCalledWith('#EA4335');

  expect(setters.setEditable).toBeCalledWith(true);
  expect(dispatchers.globalDispatch).toBeCalledWith(
    GlobalStore.setLoading(false),
  );
});

it('Test with code (full / 404)', async () => {
  const dispatchers = createContexts();
  const setters = createStates('123123', 60);

  BackendApi.auth.mockReturnValueOnce(404);

  const navigate = jest.fn();
  const reset = jest.fn();
  const goBack = jest.fn();
  const component = await render(
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
  expect(dispatchers.globalDispatch).toBeCalledWith(
    GlobalStore.setLoading(true),
  );
  expect(setters.setCode).toBeCalledWith('');
  expect(setters.setBorderColor).toBeCalledWith('#EA4335');

  expect(setters.setEditable).toBeCalledWith(true);
  expect(dispatchers.globalDispatch).toBeCalledWith(
    GlobalStore.setLoading(false),
  );
});

it('Test resend (200)', async () => {
  const dispatchers = createContexts();
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
    BackendApi.CodeType.Email,
    BackendApi.CheckType.Auth,
  );
});

it('Test resend (400)', async () => {
  const dispatchers = createContexts();
  const setters = createStates('', 0);

  BackendApi.sendCode.mockReturnValueOnce(400);
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
    BackendApi.CodeType.Email,
    BackendApi.CheckType.Auth,
  );
  expect(dispatchers.dialogDispatch.mock.calls[0][0]).toMatchSnapshot();
  await dispatchers.dialogDispatch.mock.calls[0][0].onPress();
  expect(dispatchers.dialogDispatch).toBeCalledWith(Dialog.close());
});

it('Test resend (404/email)', async () => {
  const dispatchers = createContexts();
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
    BackendApi.CodeType.Email,
    BackendApi.CheckType.Auth,
  );
  expect(dispatchers.dialogDispatch.mock.calls[0][0]).toMatchSnapshot();
  await dispatchers.dialogDispatch.mock.calls[0][0].onPress();
  expect(dispatchers.dialogDispatch).toBeCalledWith(Dialog.close());
});

it('Test resend (404/phone)', async () => {
  const dispatchers = createContexts();
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
    BackendApi.CodeType.Phone,
    BackendApi.CheckType.Auth,
  );
  expect(dispatchers.dialogDispatch.mock.calls[0][0]).toMatchSnapshot();
  await dispatchers.dialogDispatch.mock.calls[0][0].onPress();
  expect(dispatchers.dialogDispatch).toBeCalledWith(Dialog.close());
});
