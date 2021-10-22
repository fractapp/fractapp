import React, {useState} from 'react';
import renderer from 'react-test-renderer';
import {ImportWallet} from 'screens/ImportWallet';
import {fireEvent, render} from '@testing-library/react-native';
import googleUtils from 'utils/google';
import StringUtils from 'utils/string';
import Backup from 'utils/backup';
import { useDispatch } from 'react-redux';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));
jest.mock('@polkadot/util-crypto', () => ({
  mnemonicValidate: jest.fn(),
}));
jest.mock('react-native-crypto', () => ({}));
jest.mock('react-native-document-picker', () => ({
  pick: jest.fn(),
  types: {
    allFiles: 'allFiles',
  },
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));
jest.mock('utils/backup', () => ({
  getWalletsFromGoogle: jest.fn(),
  BackupType: {
    GoogleDrive: 1,
  },
  backupGoogleDrive: jest.fn(),
  checkPermissions: jest.fn(),
  getFile: jest.fn(),
}));
jest.mock('utils/google', () => ({
  getFileBackup: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

useState.mockImplementation((init) => [init, jest.fn()]);

const dispatch = jest.fn();
useDispatch.mockReturnValue(dispatch);

it('Test view', () => {
  const tree = renderer.create(<ImportWallet />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test backup google drive', async () => {
  Backup.getWalletsFromGoogle.mockReturnValueOnce(
    {
      wallets: ['0'],
      ids: ['1'],
    }
  );
  const navigate = jest.fn();

  const component = render(<ImportWallet navigation={{navigate: navigate}} />);
  await fireEvent.press(
    component.getByText(StringUtils.texts.importWallet.googleDriveTitle),
  );

  expect(googleUtils.signIn).toBeCalled();
  expect(googleUtils.signOut).toBeCalled();
  expect(navigate()).toMatchSnapshot('GoogleDrivePicker');
});

it('Test backup google drive with 0 wallets', async () => {
  Backup.getWalletsFromGoogle.mockReturnValueOnce(
    {
      wallets: [],
      ids: ['1'],
    }
  );
  const navigate = jest.fn();

  const component = render(<ImportWallet navigation={{navigate: navigate}} />);
  await fireEvent.press(
    component.getByText(StringUtils.texts.importWallet.googleDriveTitle),
  );

  expect(googleUtils.signIn).toBeCalled();
  expect(googleUtils.signOut).toBeCalled();
  expect(component).toMatchSnapshot();
});

it('Test backup google drive with 3 wallets', async () => {
  Backup.getWalletsFromGoogle.mockReturnValueOnce(
    {
      wallets: ['0', '1', '2'],
      ids: ['1'],
    }
  );
  const navigate = jest.fn();

  const component = render(<ImportWallet navigation={{navigate: navigate}} />);
  await fireEvent.press(
    component.getByText(StringUtils.texts.importWallet.googleDriveTitle),
  );

  expect(googleUtils.signIn).toBeCalled();
  expect(googleUtils.signOut).toBeCalled();
  expect(navigate()).toMatchSnapshot('ChooseImportWallet');
});

it('Test seed', async () => {
  const navigate = jest.fn();
  const component = render(<ImportWallet navigation={{navigate: navigate}} />);
  await fireEvent.press(
    component.getByText(StringUtils.texts.importWallet.manuallyTitle),
  );

  expect(navigate.mock.calls[0][0]).toMatchSnapshot();
});
