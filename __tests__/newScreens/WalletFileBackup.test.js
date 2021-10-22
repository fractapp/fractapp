import React, {useState} from 'react';
import {WalletFileBackup} from 'screens/WalletFileBackup';
import renderer from 'react-test-renderer';
import backupUtil from 'utils/backup';
import {fireEvent, render} from '@testing-library/react-native';
import BackupUtils from 'utils/backup';
import StringUtils from 'utils/string';
import {NativeModules} from 'react-native';
import googleUtils from 'utils/google';
import { useDispatch, useSelector } from 'react-redux';
import Store from 'storage/Store';
import GlobalStore from 'storage/Global';
import tasks from 'utils/tasks';

jest.mock('react-native-background-timer', () => ({}));
jest.mock('storage/DB', () => ({}));
jest.mock('utils/tasks', () => ({
  createAccount: jest.fn(),
}));
jest.mock('react-native-crypto', () => {});
jest.mock('react-native-fs', () => {});
jest.mock('react-native-share', () => {});
jest.mock('@polkadot/util-crypto', () => ({
  randomAsHex: jest.fn(),
  encodeAddress: jest.fn(),
}));
jest.mock('utils/google', () => ({
  getFileBackup: jest.fn(),
}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));
jest.mock('utils/backup', () => ({
  getWalletsFromGoogle: jest.fn(),
  GoogleDriveFolder: 'fractapp',
  BackupType: {
    GoogleDrive: 1,
  },
  checkPermissions: jest.fn(),
  backup: jest.fn(),
  getSeed: jest.fn(),
  randomFilename: jest.fn(() => '0xff00ff00'),
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));
jest.mock('utils/tasks', () => ({
  createAccount: jest.fn(),
}));
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

NativeModules.PreventScreenshotModule = {
  forbid: async () => {},
  allow: async () => {},
};
jest.useFakeTimers();

useState.mockImplementation((init) => [init, jest.fn()]);

const dispatch = jest.fn();
useDispatch.mockReturnValue(dispatch);

let store = Store.initValues();
useSelector.mockImplementation((fn) => {
  return fn(store);
});

const params = {
  seed: 'staff select toddler junior robot own paper sniff glare drive stay census'.split(
    ' ',
  ),
  type: backupUtil.BackupType.File,
  isNewAccount: true,
};

it('Test empty password', () => {
  const tree = renderer
    .create(<WalletFileBackup route={{params: params}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test loading', () => {
  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()]);

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

  const tree = renderer
    .create(<WalletFileBackup route={{params: params}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click encrypt', () => {
  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => ['Aa123123', jest.fn()])
    .mockImplementationOnce((init) => ['Aa123123', jest.fn()]);

  const mockNav = jest.fn();

  const component = render(
    <WalletFileBackup route={{params: params}} navigation={{reset: mockNav}} />,
  );
  fireEvent.press(component.getByText(StringUtils.texts.ConfirmBtnTitle));

  expect(dispatch).toBeCalledWith(GlobalStore.actions.showLoading());
});

it('Test backup', async () => {
  let store = Store.initValues();
  store.global.loadInfo.isLoadingShow = true;
  useSelector.mockImplementationOnce((fn) => {
    return fn(store);
  });

  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => ['Aa123123', jest.fn()])
    .mockImplementationOnce((init) => ['Aa123123', jest.fn()]);

  backupUtil.backup.mockReturnValueOnce({
    isExist: false,
    isError: false,
  });
  backupUtil.getWalletsFromGoogle.mockReturnValueOnce({
    wallets: ['0xff00ff00.json'],
    ids: ['123123'],
  });
  googleUtils.getFileBackup.mockReturnValueOnce({
    seed: params.seed.join(' '),
    algorithm: 'algorithm',
  });
  backupUtil.getSeed.mockReturnValueOnce(params.seed.join(' '));

  const mockNav = jest.fn();

  render(
    <WalletFileBackup route={{params: params}} navigation={{reset: mockNav}} />,
  );

  jest.runAllTimers();

  expect(googleUtils.getFileBackup).toBeCalledWith('123123');
  expect(backupUtil.getSeed).toBeCalledWith(
    {
      seed: params.seed.join(' '),
      algorithm: 'algorithm',
    },
    'Aa123123',
  );

  expect(dispatch).toBeCalledWith(GlobalStore.actions.hideLoading());
  expect(BackupUtils.backup).toBeCalledWith(
    params.seed.join(' '),
    'Aa123123',
    '0xff00ff00',
    params.type,
  );
  expect(tasks.createAccount).toBeCalledWith(params.seed.join(' '), dispatch);

  expect(mockNav).toBeCalledWith({
    index: 0,
    routes: [{name: 'Home'}],
  });
});

it('Test res isError', () => {
  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()]);

  BackupUtils.backup.mockReturnValueOnce({isError: true});

  const tree = render(
    <WalletFileBackup route={{params: params}} />
  );
  expect(tree).toMatchSnapshot();
});

it('Test res isExist', () => {
  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()]);

  BackupUtils.backup.mockReturnValueOnce({isExist: true});

  const tree = render(
    <WalletFileBackup route={{params: params}} />
  );
  expect(tree).toMatchSnapshot();
});

it('Test !isSuccessSave', () => {
  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
  ;
  BackupUtils.getSeed.mockReturnValueOnce('some seed');

  const tree = render(
    <WalletFileBackup route={{params: params}} />
  );
  expect(tree).toMatchSnapshot();
});

/*it('Test renderButtonOrError', () => {
  const schema = new passwordValidator();
  schema.validate.mockReturnValueOnce(false);

  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => ['1234567890', jest.fn()])
    .mockImplementationOnce((init) => ['1234567890', jest.fn()])
    .mockImplementationOnce((init) => [true, jest.fn()]);

  const tree = render(
    <WalletFileBackup route={{params: params}} />
  );
  expect(tree).toMatchSnapshot();
});*/
