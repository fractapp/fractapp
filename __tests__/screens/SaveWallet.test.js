import React, {useContext, useState} from 'react';
import renderer from 'react-test-renderer';
import {SaveWallet} from 'screens/SaveWallet';
import DB from 'storage/DB';
import {fireEvent, render} from '@testing-library/react-native';
import BackupUtils from 'utils/backup';
import GlobalStore from 'storage/Global';
import {mnemonicGenerate} from '@polkadot/util-crypto';
import DialogStore from 'storage/Dialog';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useContext: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));
jest.mock('utils/backup', () => {});
jest.mock('@polkadot/util-crypto', () => ({
  mnemonicGenerate: jest.fn(() => ''),
}));
jest.mock('utils/backup', () => ({
  backupGoogleDrive: jest.fn(),
  BackupType: {
    GoogleDrive: 12,
    File: 13,
  },
  checkPermissions: jest.fn(),
}));

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view', () => {
  const tree = renderer.create(<SaveWallet navigation={null} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test backup google drive', async () => {
  const navigate = jest.fn();
  const seed = 'seed seed';
  mnemonicGenerate.mockReturnValueOnce(seed);

  const component = render(<SaveWallet navigation={{navigate: navigate}} />);
  await fireEvent.press(component.getByText('Google drive'));
  BackupUtils.backupGoogleDrive.mock.calls[0][0]();

  expect(navigate.mock.calls[0][0]).toMatchSnapshot();
  expect(navigate.mock.calls[0][1]).toMatchSnapshot();
});

it('Test backup file', async () => {
  const navigate = jest.fn();
  const seed = 'seed seed';
  mnemonicGenerate.mockReturnValueOnce(seed);

  const dispatch = jest.fn();
  useContext.mockReturnValueOnce({
    state: DialogStore.initialState(),
    dispatch: dispatch,
  });

  const component = render(<SaveWallet navigation={{navigate: navigate}} />);
  await fireEvent.press(component.getByText('Encrypted file'));
  BackupUtils.checkPermissions.mock.calls[0][0]();
  BackupUtils.checkPermissions.mock.calls[0][1]();

  expect(navigate.mock.calls[0][0]).toMatchSnapshot();
  expect(navigate.mock.calls[0][1]).toMatchSnapshot();

  expect(dispatch).toMatchSnapshot();
});

it('Test seed', async () => {
  const navigate = jest.fn();
  const seed = 'seed seed';
  mnemonicGenerate.mockReturnValueOnce(seed);

  const component = render(<SaveWallet navigation={{navigate: navigate}} />);
  await fireEvent.press(component.getByText('Backup seed'));

  expect(navigate.mock.calls[0][0]).toMatchSnapshot();
  expect(navigate.mock.calls[0][1]).toMatchSnapshot();
});
