import React from 'react';
import AmountInput from 'components/AmountInput';

jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
  useState: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));

jest.mock('adaptors/adaptor', () => ({
  Adaptors: {
    init: jest.fn(),
    get: jest.fn(),
  },
}));

it('Test onChangeText', () => {
  expect(AmountInput.onChangeText('text', true)).toMatchSnapshot();
});
