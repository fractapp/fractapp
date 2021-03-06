import React, {useState} from 'react';
import renderer from 'react-test-renderer';
import {ImportSeed} from 'screens/ImportSeed';
import BackendApi from 'utils/backend';

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

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view', () => {
  const tree = renderer.create(<ImportSeed />).toJSON();
  expect(tree).toMatchSnapshot();
});
