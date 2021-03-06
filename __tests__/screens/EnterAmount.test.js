import React, {useState} from 'react';
import renderer from 'react-test-renderer';
import {EnterAmount} from 'screens/EnterAmount';
import {Currency, Wallet} from 'types/wallet';

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
jest.mock('utils/google', () => ({}));
jest.mock('utils/polkadot', () => ({
  Api: {
    getInstance: jest.fn(),
  },
}));

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view', () => {
  const tree = renderer
    .create(
      <EnterAmount
        navigation={{
          setOptions: jest.fn(),
        }}
        route={{
          params: {
            wallet: new Wallet(
              'Wallet Polkadot',
              'address#1',
              Currency.Polkadot,
              100,
              '1000000000000',
              10,
            ),
            receiver: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
