import React, {useContext, useState} from 'react';
import renderer from 'react-test-renderer';
import {ImportWallet} from 'screens/ImportWallet';
import {fireEvent, render} from '@testing-library/react-native';
import DialogStore from 'storage/Dialog';
import googleUtils from 'utils/google';
import DocumentPicker from 'react-native-document-picker';
import backupUtils from 'utils/backup';
import BackupUtils from 'utils/backup';
import StringUtils from 'utils/string';
import GlobalStore from 'storage/Global';
import Backup from 'utils/backup';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useContext: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));
jest.mock('@polkadot/util-crypto', () => ({
  mnemonicValidate: jest.fn(),
}));
jest.mock('react-native-crypto', () => ({}));
jest.mock('utils/google', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
}));
jest.mock('utils/backup', () => ({
  backupGoogleDrive: jest.fn(),
  BackupType: {
    GoogleDrive: 12,
    File: 13,
  },
  checkPermissions: jest.fn(),
  getFile: jest.fn(),
}));
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
}));
jest.mock('utils/google', () => ({
  getFileBackup: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

useState.mockImplementation((init) => [init, jest.fn()]);

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
  useContext.mockReturnValueOnce({
    dispatch: () => null,
  });

  const component = render(<ImportWallet navigation={{navigate: navigate}} />);
  await fireEvent.press(
    component.getByText(StringUtils.texts.importWallet.googleDriveTitle),
  );

  expect(googleUtils.signIn).toBeCalled();
  expect(googleUtils.signOut).toBeCalled();
  expect(navigate()).toMatchSnapshot('GoogleDrivePicker');
});

it('Test backup google drive with 0 wallets', async () => {
  const globalState = {
    setLoading: jest.fn(),
  };
  useContext.mockReturnValueOnce({
    state: globalState,
    dispatch: jest.fn(),
  });
  Backup.getWalletsFromGoogle.mockReturnValueOnce(
    {
      wallets: [],
      ids: ['1'],
    }
  );
  const navigate = jest.fn();
  useContext.mockReturnValueOnce({
    dispatch: () => null,
  });

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
  useContext.mockReturnValueOnce({
    dispatch: () => null,
  });
  
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
