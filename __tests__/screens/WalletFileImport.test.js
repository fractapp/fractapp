import React, {useContext, useState} from 'react';
import {WalletFileImport} from 'screens/WalletFileImport';
import renderer from 'react-test-renderer';
import GlobalStore from 'storage/Global';
import {fireEvent, render} from '@testing-library/react-native';
import BackupUtils from 'utils/backup';
import DB from 'storage/DB';
import StringUtils from 'utils/string';
import { NativeModules } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Store from 'storage/Store';
import tasks from 'utils/tasks';
import Dialog from 'storage/Dialog';

jest.mock('react-native-crypto', () => {});
jest.mock('storage/DB', () => ({}));
jest.mock('utils/tasks', () => ({
  createAccount: jest.fn(),
}));
jest.mock('utils/backup', () => ({
  getSeed: jest.fn(),
}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
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

it('Test positive', () => {
  const tree = renderer
    .create(<WalletFileImport route={{params: {file: {}}}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test loading', () => {
  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce(() => [true, jest.fn()]);

  const tree = renderer
    .create(<WalletFileImport route={{params: {file: {}}}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test useEffect', async () => {
  const setLoading = jest.fn();
  useState
    .mockImplementationOnce((init) => ['123123', jest.fn()])
    .mockImplementationOnce(() => [true, setLoading]);

  const file = {
    seed: 'seed',
    algorithm: 'algorithm',
  };

  BackupUtils.getSeed.mockReturnValueOnce(file.seed);

  await render(
    <WalletFileImport route={{params: {file: file}}} />,
  );

  expect(BackupUtils.getSeed).toBeCalledWith(file, '123123');
  expect(tasks.createAccount).toBeCalledWith('seed', dispatch);
});

it('Test useEffect throw', async () => {
  const setLoading = jest.fn((f) => f);
  useState
    .mockImplementationOnce((init) => ['123123', jest.fn()])
    .mockImplementationOnce(() => [true, setLoading(false)]);

  const file = {
    seed: 'seed',
    algorithm: 'algorithm',
  };

  BackupUtils.getSeed.mockImplementationOnce(() => {
    throw new Error('error');
  });

  await render(
    <WalletFileImport route={{ params: { file: file } }} />,
  );

  expect(dispatch).toBeCalledWith(
    Dialog.actions.showDialog({
        title: StringUtils.texts.walletFileImport.invalidPasswordTitle,
        text: '',
      }
    )
  );
  expect(setLoading).toBeCalledWith(false);
});

it('Test click Decrypt', () => {
  const setLoading = jest.fn();
  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce(() => [false, setLoading]);

  const component = render(<WalletFileImport route={{params: {file: {}}}} />);
  fireEvent.press(component.getByText(StringUtils.texts.RestoreBtn));

  expect(setLoading).toBeCalledWith(true);
});
