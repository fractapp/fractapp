import React, { useContext, useRef, useState } from 'react';
import renderer from 'react-test-renderer';
import {AmountInput} from 'components/AmountInput';
import { Currency, Wallet } from 'types/wallet';
import { render } from '@testing-library/react-native';
import PricesStore from 'storage/Prices';
import StringUtils from 'utils/string';
import { Adaptors } from 'adaptors/adaptor';
import BN from 'bn.js';

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
    isValidTransfer: jest.fn(),
  },
}));
/*jest.mock('bn.js', () => ({
    cmp: jest.fn(),
}));*/


it('Test AmountInput view 1', () => {
  const wallet = new Wallet(
    'Wallet Polkadot',
    'address#1',
    Currency.DOT,
    100,
    '1000000000000',
    10,
    0,
  );

  useContext.mockReturnValueOnce({
    state: PricesStore.initialState(),
    dispatch: jest.fn(),
  });
  Adaptors.get.mockReturnValueOnce({decimals: 5});
  useState
    .mockImplementationOnce((init) => [true, jest.fn()])
    .mockImplementationOnce((init) => ['', jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()]);

  const tree = render(
      <AmountInput
      wallet={wallet}
      receiver="receiver"
      usdMode={true}
      defaultValue="defaultValue1"
      width="100%"
      onChangeValues={jest.fn()}
      onSetLoading={jest.fn()}
    />
  );
  expect(tree).toMatchSnapshot();
});

it('Test AmountInput view 2', () => {
  const wallet = new Wallet(
    'Wallet Polkadot',
    'address#1',
    Currency.DOT,
    100,
    '1000000000000',
    10,
    0,
  );

  useContext.mockReturnValueOnce({
    state: PricesStore.initialState(),
    dispatch: jest.fn(),
  });
  Adaptors.get.mockReturnValueOnce({decimals: 5});
  useState
    .mockImplementationOnce((init) => [true, jest.fn()])
    .mockImplementationOnce((init) => ['', jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()]);

  const tree = render(
    <AmountInput
      wallet={wallet}
      receiver="receiver"
      usdMode={false}
      defaultValue="defaultValue2"
      width="100%"
      onChangeValues={jest.fn()}
      onSetLoading={jest.fn()}
    />
  );
  expect(tree).toMatchSnapshot();
});

it('Test AmountInput view 3', () => {
  const wallet = new Wallet(
    'Wallet Polkadot',
    'address#1',
    Currency.DOT,
    100,
    '1000000000000',
    '1',
    0,
  );

  useContext.mockReturnValueOnce({
    state: PricesStore.initialState(),
    dispatch: jest.fn(),
  });
  Adaptors.get.mockReturnValueOnce({decimals: 5});
  useState
    .mockImplementationOnce((init) => [true, jest.fn()])
    .mockImplementationOnce((init) => ['', jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [new BN(1), jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [1, jest.fn()]);

  const tree = render(
    <AmountInput
      wallet={wallet}
      receiver="receiver"
      usdMode={true}
      defaultValue=""
      width="100%"
      onChangeValues={jest.fn()}
      onSetLoading={jest.fn()}
    />
  );
  expect(tree).toMatchSnapshot();
});

it('Test AmountInput view 4', () => {
  const wallet = new Wallet(
    'Wallet Polkadot',
    'address#1',
    Currency.DOT,
    100,
    '1000000000000',
    '1',
    0,
  );

  useContext.mockReturnValueOnce({
    state: PricesStore.initialState(),
    dispatch: jest.fn(),
  });
  Adaptors.get.mockReturnValueOnce({decimals: 5});
  useState
    .mockImplementationOnce((init) => [true, jest.fn()])
    .mockImplementationOnce((init) => ['', jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [1, jest.fn()])
    .mockImplementationOnce((init) => [new BN(1), jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [1, jest.fn()]);

  Adaptors.isValidTransfer.mockReturnValueOnce({isOk: true});

  const tree = render(
    <AmountInput
      wallet={wallet}
      receiver="receiver"
      usdMode={true}
      width="100%"
      defaultValue=""
    />
  );
  expect(tree).toMatchSnapshot();
});
