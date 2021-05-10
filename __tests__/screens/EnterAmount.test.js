import React, {useState} from 'react';
import renderer from 'react-test-renderer';
import {EnterAmount} from 'screens/EnterAmount';
import {Currency, Wallet} from 'types/wallet';
import {fireEvent, render} from '@testing-library/react-native';
import MathUtils from 'utils/math';
import BN from 'bn.js';

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
jest.mock('adaptors/adaptor', () => ({
  Api: {
    getInstance: jest.fn(),
  },
}));
jest.mock('utils/math', () => ({
  calculateValue: jest.fn(),
  calculateTxInfo: jest.fn(),
}));
jest.mock('storage/DB', () => ({}));

useState.mockImplementation((init) => [init, jest.fn()]);

const setStates = (value, alternativeValue) => {
  const setAlternativeValue = jest.fn();
  const setUsdFee = jest.fn();
  const setPlankFee = jest.fn();
  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [value, jest.fn()])
    .mockImplementationOnce((init) => [alternativeValue, setAlternativeValue])
    .mockImplementationOnce((init) => [init, setUsdFee])
    .mockImplementationOnce((init) => [init, setPlankFee]);

  return {
    setAlternativeValue: setAlternativeValue,
    setUsdFee: setUsdFee,
    setPlankFee: setPlankFee,
  };
};
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
              Currency.DOT,
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

it('Test calculate value #1', async () => {
  const setters = setStates(100, 0);
  MathUtils.calculateAlternativeValue.mockReturnValueOnce(125);
  const component = await render(
    <EnterAmount
      navigation={{
        setOptions: jest.fn(),
      }}
      route={{
        params: {
          wallet: new Wallet(
            'Wallet Polkadot',
            'address#1',
            Currency.DOT,
            100,
            '1000000000000',
            10,
          ),
          receiver: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
        },
      }}
    />,
  );
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  }); //TODO

  expect(setters.setAlternativeValue).toBeCalledWith(125);
});

it('Test calculate value #2', async () => {
  const setters = setStates(100, 126);
  MathUtils.calculateTxInfo.mockReturnValueOnce({
    fee: new BN('1000000'),
    usdFee: 127,
  });
  const component = await render(
    <EnterAmount
      navigation={{
        setOptions: jest.fn(),
      }}
      route={{
        params: {
          wallet: new Wallet(
            'Wallet Polkadot',
            'address#1',
            Currency.DOT,
            100,
            '1000000000000',
            10,
          ),
          receiver: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
        },
      }}
    />,
  );
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  }); //TODO

  expect(setters.setPlankFee.mock.calls[0][0].toString()).toEqual(
    new BN('1000000').toString(),
  );
  expect(setters.setUsdFee).toBeCalledWith(127);
});
