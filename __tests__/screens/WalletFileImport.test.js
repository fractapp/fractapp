import React, {useState} from 'react';

import {WalletFileImport} from 'screens/WalletFileImport';
import renderer from 'react-test-renderer';
import GlobalStore from 'storage/Global';

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
}));

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test positive', () => {
  const tree = renderer
    .create(
      <GlobalStore.Context.Provider
        value={{
          isSign: false,
        }}>
        <WalletFileImport route={{params: {file: {}}}} />
      </GlobalStore.Context.Provider>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test loading', () => {
  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce(() => [true, jest.fn()]);
  const tree = renderer
    .create(
      <GlobalStore.Context.Provider
        value={{
          isSign: false,
        }}>
        <WalletFileImport route={{params: {file: {}}}} />
      </GlobalStore.Context.Provider>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
