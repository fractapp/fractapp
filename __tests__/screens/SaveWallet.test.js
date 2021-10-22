import React, {useContext, useState} from 'react';
import renderer from 'react-test-renderer';
import {SaveWallet} from 'screens/SaveWallet';
import DB from 'storage/DB';
import {fireEvent, render} from '@testing-library/react-native';
import BackupUtils from 'utils/backup';
import GlobalStore from 'storage/Global';
import {mnemonicGenerate} from '@polkadot/util-crypto';
import DialogStore from 'storage/Dialog';
import StringUtils from 'utils/string';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));
jest.mock('utils/backup', () => {});
jest.mock('@polkadot/util-crypto', () => ({
  mnemonicGenerate: jest.fn(() => ''),
}));
jest.mock('utils/backup', () => ({
  backupGoogleDrive: jest.fn(),
  BackupType: {
    GoogleDrive: 1,
  },
  checkPermissions: jest.fn(),
}));

jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));
useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view', () => {
  const seed = 'seed seed';

  const tree = renderer
    .create(<SaveWallet navigation={null} route={{params: {seed: seed}}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test backup google drive', async () => {
  const navigate = jest.fn();
  const seed = 'seed seed';

  const component = render(
    <SaveWallet
      navigation={{navigate: navigate}}
      route={{params: {seed: seed}}}
    />,
  );
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

  const component = render(
    <SaveWallet
      navigation={{navigate: navigate}}
      route={{params: {seed: seed}}}
    />,
  );
  await fireEvent.press(
    component.getByText(StringUtils.texts.backup.manuallyTitle),
  );

  expect(navigate.mock.calls[0][0]).toMatchSnapshot();
  expect(navigate.mock.calls[0][1]).toMatchSnapshot();
});
