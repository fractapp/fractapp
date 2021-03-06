import React, {useState} from 'react';
import renderer from 'react-test-renderer';
import {NewPassCode} from 'screens/NewPassCode';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view', () => {
  const tree = renderer.create(<NewPassCode navigation={null} />).toJSON();
  expect(tree).toMatchSnapshot();
});
