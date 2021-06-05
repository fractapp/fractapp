import React, {useContext, useState} from 'react';
import {WalletFileBackup} from 'screens/WalletFileBackup';
import renderer from 'react-test-renderer';
import backupUtil from 'utils/backup';
import GlobalStore from 'storage/Global';
import DialogStore from 'storage/Dialog';
import {fireEvent, render} from '@testing-library/react-native';
import BackupUtils from 'utils/backup';
import DB from 'storage/DB';
import StringUtils from 'utils/string';
import { NativeModules } from 'react-native';

jest.mock('storage/DB', () => ({
  createAccounts: jest.fn(),
}));
jest.mock('react-native-crypto', () => {});
jest.mock('react-native-fs', () => {});
jest.mock('react-native-share', () => {});
jest.mock('@polkadot/util-crypto', () => ({
  randomAsHex: jest.fn(),
}));
jest.mock('utils/google', () => {});
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useContext: jest.fn(),
}));
jest.mock('utils/backup', () => ({
  backupGoogleDrive: jest.fn(),
  GoogleDriveFolder: 'fractapp',
  BackupType: {
    GoogleDrive: 12,
    File: 13,
  },
  checkPermissions: jest.fn(),
  backup: jest.fn(),
  randomFilename: jest.fn(() => '0xff00ff00'),
}));

NativeModules.PreventScreenshotModule = {
  forbid: jest.fn(() => new Promise.resolve({ data: {} }))
};

useState.mockImplementation((init) => [init, jest.fn()]);

const params = {
  seed: 'staff select toddler junior robot own paper sniff glare drive stay census'.split(
    ' ',
  ),
  type: backupUtil.BackupType.File,
  isNewAccount: true,
};

it('Test empty password', () => {
  useContext.mockReturnValueOnce({
    state: DialogStore.initialState(),
    dispatch: jest.fn(),
  });
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: jest.fn(),
  });

  const tree = renderer
    .create(<WalletFileBackup route={{params: params}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test loading', () => {
  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [true, jest.fn()]);

  useContext.mockReturnValueOnce({
    state: DialogStore.initialState(),
    dispatch: jest.fn(),
  });

  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: jest.fn(),
  });

  const tree = renderer
    .create(<WalletFileBackup route={{params: params}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test minimum password length', () => {
  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => ['123', jest.fn()])
    .mockImplementationOnce((init) => ['123', jest.fn()]);

  useContext.mockReturnValueOnce({
    state: DialogStore.initialState(),
    dispatch: jest.fn(),
  });

  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: jest.fn(),
  });

  const tree = renderer
    .create(<WalletFileBackup route={{params: params}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test password do not match', () => {
  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => ['123123', jest.fn()])
    .mockImplementationOnce((init) => ['123111', jest.fn()]);

  useContext.mockReturnValueOnce({
    state: DialogStore.initialState(),
    dispatch: jest.fn(),
  });

  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: jest.fn(),
  });

  const tree = renderer
    .create(<WalletFileBackup route={{params: params}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test success password', () => {
  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => ['123123', jest.fn()])
    .mockImplementationOnce((init) => ['123123', jest.fn()]);

  useContext.mockReturnValueOnce({
    state: DialogStore.initialState(),
    dispatch: jest.fn(),
  });

  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: jest.fn(),
  });

  const tree = renderer
    .create(<WalletFileBackup route={{params: params}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click encrypt', () => {
  let isLoader = false;
  const setLoader = jest.fn((value) => (isLoader = value));

  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => ['123123', jest.fn()])
    .mockImplementationOnce((init) => ['123123', jest.fn()])
    .mockImplementationOnce((init) => [isLoader, setLoader]);

  const dialogDispatch = jest.fn();
  useContext.mockReturnValueOnce({
    state: DialogStore.initialState(),
    dispatch: dialogDispatch,
  });

  const globalDispatch = jest.fn();
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: globalDispatch,
  });

  const mockNav = jest.fn();

  const component = render(
    <WalletFileBackup route={{params: params}} navigation={{reset: mockNav}} />,
  );
  fireEvent.press(component.getByText(StringUtils.texts.NextBtnTitle));

  expect(setLoader).toBeCalledWith(true);
});

it('Test backup', async () => {
  const setLoading = jest.fn();
  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => ['123123', jest.fn()])
    .mockImplementationOnce((init) => ['123123', jest.fn()])
    .mockImplementationOnce((init) => [true, setLoading]);

  const dialogDispatch = jest.fn();
  useContext.mockReturnValueOnce({
    state: DialogStore.initialState(),
    dispatch: dialogDispatch,
  });

  const globalDispatch = jest.fn();
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: globalDispatch,
  });

  const mockNav = jest.fn();

  const component = await render(
    <WalletFileBackup route={{params: params}} navigation={{reset: mockNav}} />,
  );
  expect(setLoading).toBeCalledWith(false);
  expect(BackupUtils.backup).toBeCalledWith(
    params.seed.join(' '),
    '123123',
    '0xff00ff00',
    params.type,
  );
  expect(DB.createAccounts).toBeCalledWith(params.seed.join(' '));

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  }); //TODO

  expect(dialogDispatch.mock.calls[0][0].text).toMatchSnapshot();
  expect(dialogDispatch.mock.calls[0][0].title).toMatchSnapshot();

  await dialogDispatch.mock.calls[0][0].onPress();

  expect(dialogDispatch.mock.calls[1][0]).toMatchSnapshot();
  expect(globalDispatch.mock.calls[0][0]).toMatchSnapshot();
  expect(mockNav).toBeCalledWith({
    index: 0,
    routes: [{name: 'Home'}],
  });
});
