import React, {useState} from 'react';
import renderer from 'react-test-renderer';
import {EnterAmount} from 'screens/EnterAmount';
import {Currency, Wallet} from 'types/wallet';
import {fireEvent, render} from '@testing-library/react-native';
import MathUtils from 'utils/math';
import BN from 'bn.js';
import {Network} from 'types/account';

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
  roundUsd: jest.fn(),
}));
jest.mock('storage/DB', () => ({}));

jest.useFakeTimers();
useState.mockImplementation((init) => [init, jest.fn()]);

const setStates = (value, alternativeValue) => {
  const setAlternativeValue = jest.fn();
  const setUsdFee = jest.fn();
  const setPlankFee = jest.fn();
  const setValid = jest.fn();

  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [value, jest.fn()])
    .mockImplementationOnce((init) => [alternativeValue, setAlternativeValue])
    .mockImplementationOnce((init) => [init, setPlankFee])
    .mockImplementationOnce((init) => [init, setUsdFee])
    .mockImplementationOnce((init) => [init, setValid]);

  return {
    setAlternativeValue: setAlternativeValue,
    setUsdFee: setUsdFee,
    setPlankFee: setPlankFee,
    setValid: setValid,
  };
};
it('Test view', () => {
  MathUtils.roundUsd.mockReturnValueOnce(1000);
  const setters = setStates(null, null, true);
  setters.setValid.mockReturnValueOnce(true);
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
              Network.Polkadot,
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
  MathUtils.roundUsd.mockReturnValueOnce(1000);
  const setters = setStates(100, 0, true);
  setters.setValid.mockReturnValueOnce(true);

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
            Network.Polkadot,
            100,
            '1000000000000',
            10,
          ),
          receiver: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
        },
      }}
    />,
  );

  expect(setters.setAlternativeValue).toBeCalledWith(100);
});

it('Test calculate value #2', async () => {
  MathUtils.roundUsd.mockReturnValueOnce(1000);
  const setters = setStates(100, 126, true);
  setters.setValid.mockReturnValueOnce(true);

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
            Network.Polkadot,
            100,
            '1000000000000',
            10,
          ),
          receiver: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
        },
      }}
    />,
  );

  expect(setters.setPlankFee.mock.calls[0][0].toString()).toEqual(
    new BN('1000000').toString(),
  );
  expect(setters.setUsdFee).toBeCalledWith(127);
});
