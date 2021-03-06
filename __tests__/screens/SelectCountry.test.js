import React, {useState} from 'react';
import renderer from 'react-test-renderer';
import {SelectCountry} from 'screens/SelectCountry';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));
jest.mock('utils/backend', () => {});

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view', () => {
  const tree = renderer.create(<SelectCountry navigation={null} />).toJSON();
  expect(tree).toMatchSnapshot();
});
