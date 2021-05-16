import React, {useContext, useState} from 'react';
import renderer from 'react-test-renderer';
import {Backup} from 'screens/Backup';
import {fireEvent, render} from '@testing-library/react-native';
import DB from 'storage/DB';
import BackupUtils from 'utils/backup';
import GlobalStore from 'storage/Global';
import StringUtils from 'utils/string';

jest.mock('storage/DB', () => ({
  getSeed: jest.fn(),
}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useContext: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));
jest.mock('utils/backup', () => ({
  backupGoogleDrive: jest.fn(),
  BackupType: {
    GoogleDrive: 12,
    File: 13,
  },
  checkPermissions: jest.fn(),
}));
jest.mock('react-native-crypto', () => ({}));

useState.mockImplementation((init) => [init, jest.fn()]);

useContext.mockReturnValue({
  state: GlobalStore.initialState(),
  dispatch: jest.fn(),
});

it('Test view', () => {
  const tree = renderer.create(<Backup navigation={null} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test backup google drive', async () => {
  const navigate = jest.fn();
  const seed = 'seed seed';
  DB.getSeed.mockReturnValueOnce(seed);

  const component = render(<Backup navigation={{navigate: navigate}} />);
  await fireEvent.press(
    component.getByText(StringUtils.texts.backup.googleDriveTitle),
  );
  BackupUtils.backupGoogleDrive.mock.calls[0][0]();

  expect(navigate.mock.calls[0][0]).toMatchSnapshot();
  expect(navigate.mock.calls[0][1]).toMatchSnapshot();
});

it('Test seed', async () => {
  const navigate = jest.fn();
  const seed = 'seed seed';
  DB.getSeed.mockReturnValueOnce(seed);

  const component = render(<Backup navigation={{navigate: navigate}} />);
  await fireEvent.press(
    component.getByText(StringUtils.texts.backup.manuallyTitle),
  );

  expect(navigate.mock.calls[0][0]).toMatchSnapshot();
  expect(navigate.mock.calls[0][1]).toMatchSnapshot();
});
