import React, {useContext, useState} from 'react';
import {WalletFileImport} from 'screens/WalletFileImport';
import renderer from 'react-test-renderer';
import GlobalStore from 'storage/Global';
import {fireEvent, render} from '@testing-library/react-native';
import BackupUtils from 'utils/backup';
import DB from 'storage/DB';
import StringUtils from 'utils/string';
import { NativeModules } from 'react-native';

jest.mock('react-native-crypto', () => {});
jest.mock('storage/DB', () => ({
  createAccounts: jest.fn(),
}));
jest.mock('utils/backup', () => ({
  getSeed: jest.fn(),
}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useContext: jest.fn(),
}));
NativeModules.PreventScreenshotModule = {
  forbid: async () => {},
  allow: async () => {},
};
jest.useFakeTimers();

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test positive', () => {
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: jest.fn(),
  });

  const tree = renderer
    .create(<WalletFileImport route={{params: {file: {}}}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test loading', () => {
  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce(() => [true, jest.fn()]);

  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: jest.fn(),
  });

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

  const globalDispatch = jest.fn();
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: globalDispatch,
  });

  const file = {
    seed: 'seed',
    algorithm: 'algorithm',
  };

  BackupUtils.getSeed.mockReturnValueOnce(file.seed);

  const component = await render(
    <WalletFileImport route={{params: {file: file}}} />,
  );

  expect(BackupUtils.getSeed).toBeCalledWith(file, '123123');
  expect(DB.createAccounts).toBeCalledWith('seed');
  expect(globalDispatch.mock.calls[0][0]).toMatchSnapshot();
});

it('Test useEffect throw', async () => {
  const setLoading = jest.fn((f) => f);
  useState
    .mockImplementationOnce((init) => ['123123', jest.fn()])
    .mockImplementationOnce(() => [true, setLoading(false)]); //это легально?)

  const globalDispatch = jest.fn();
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: globalDispatch,
  });

  const file = {
    seed: 'seed',
    algorithm: 'algorithm',
  };

  BackupUtils.getSeed.mockImplementationOnce(() => {
    throw new Error('error');
  });

  const component = await render(
    <WalletFileImport route={{params: {file: file}}} />,
  );

  expect(setLoading).toBeCalledWith(false);
});

it('Test click Decrypt', () => {
  const setLoading = jest.fn();
  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce(() => [false, setLoading]);

  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: jest.fn(),
  });

  const component = render(<WalletFileImport route={{params: {file: {}}}} />);
  fireEvent.press(component.getByText(StringUtils.texts.RestoreBtn));

  expect(setLoading).toBeCalledWith(true);
});
