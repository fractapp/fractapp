import React, {useContext, useState} from 'react';
import renderer from 'react-test-renderer';
import {ImportWallet} from 'screens/ImportWallet';
import {fireEvent, render} from '@testing-library/react-native';
import DialogStore from 'storage/Dialog';
import googleUtils from 'utils/google';
import DocumentPicker from 'react-native-document-picker';
import backupUtils from 'utils/backup';
import BackupUtils from 'utils/backup';

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

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view', () => {
  const tree = renderer.create(<ImportWallet />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test backup google drive', async () => {
  const navigate = jest.fn();

  const component = render(<ImportWallet navigation={{navigate: navigate}} />);
  await fireEvent.press(component.getByText('Google drive'));

  expect(googleUtils.signIn).toBeCalled();
  expect(googleUtils.signOut).toBeCalled();
  expect(navigate()).toMatchSnapshot('GoogleDrivePicker');
});

it('Test from file', async () => {
  const navigate = jest.fn();

  const dispatch = jest.fn();
  useContext.mockReturnValueOnce({
    state: DialogStore.initialState(),
    dispatch: dispatch,
  });

  DocumentPicker.pick.mockReturnValueOnce({
    uri: 'uri',
  });
  backupUtils.getFile.mockReturnValueOnce({
    seed: 'seed',
    algorithm: 'algorithm',
  });

  const component = render(<ImportWallet navigation={{navigate: navigate}} />);
  await fireEvent.press(component.getByText('From file'));
  await BackupUtils.checkPermissions.mock.calls[0][0]();

  expect(DocumentPicker.pick).toBeCalledWith({
    type: [DocumentPicker.types.allFiles],
  });
  expect(backupUtils.getFile).toBeCalledWith('uri');
  expect(navigate.mock.calls[0][0]).toMatchSnapshot();
  expect(navigate.mock.calls[0][1]).toMatchSnapshot();

  await BackupUtils.checkPermissions.mock.calls[0][1]();
  expect(dispatch.mock.calls[0][0]).toMatchSnapshot();
  await dispatch.mock.calls[0][0].onPress();
  expect(dispatch.mock.calls[1][0]).toMatchSnapshot();
});

it('Test seed', async () => {
  const navigate = jest.fn();
  const component = render(<ImportWallet navigation={{navigate: navigate}} />);
  await fireEvent.press(component.getByText('Enter seed'));

  expect(navigate.mock.calls[0][0]).toMatchSnapshot();
});
