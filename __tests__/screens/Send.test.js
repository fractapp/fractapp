import React, {useState} from 'react';
import renderer from 'react-test-renderer';
import {Send} from 'screens/Send';
import {Network} from 'types/account';
import {Currency, Wallet} from 'types/wallet';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));
jest.mock('utils/backend', () => {});
jest.mock('utils/tasks', () => {});

jest.mock('@polkadot/util-crypto', () => {});
jest.mock('adaptors/adaptor', () => ({
  Api: {
    getInstance: async () => jest.fn()(),
  },
  Adaptors: {
    get: async () => jest.fn(),
  },
}));

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view', () => {
  const tree = renderer
    .create(
      <Send
        navigation={null}
        route={{
          params: {
            wallet: new Wallet(
              'Wallet Polkadot',
              'address#1',
              Currency.DOT,
              Network.Polkadot,
              100,
              '1000000000000',
              10,
            ),
          },
          isEditable: false,
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
