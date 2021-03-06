import React, {useState} from 'react';
import renderer from 'react-test-renderer';
import {VerifyPassCode} from 'screens/VerifyPassCode';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));
jest.mock('utils/passcode', () => {});

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view', () => {
  const tree = renderer
    .create(<VerifyPassCode navigation={null} route={{params: {}}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
