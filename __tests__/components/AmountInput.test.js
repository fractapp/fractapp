import React from 'react';
import renderer from 'react-test-renderer';
import AmountInput from 'components/AmountInput';
import { Currency, Wallet } from 'types/wallet';

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
jest.mock('storage/DB', () => {});
jest.mock('adaptors/adaptor', () => ({
  Adaptors: {
    init: jest.fn(),
    get: jest.fn(),
  },
}));

it('Test 1', () => {
  const wallet = new Wallet(
    'Wallet Polkadot',
    'address#1',
    Currency.DOT,
    100,
    '1000000000000',
    10,
    0,
  );
  const tree = renderer
    .create(
      <AmountInput
        wallet={wallet}
        receiver="receiver"
        usdMode={true}
        defaultValue="defaultValue"
        width="100%"
      />,
    )
    .toJSON();

  expect(tree).toMatchSnapshot();
});
