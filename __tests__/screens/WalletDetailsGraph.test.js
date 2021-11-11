import React, {useContext, useState} from 'react';
import {Currency} from 'types/wallet';
import { TxAction, TxStatus, TxType } from 'types/transaction';
import {fireEvent, render} from '@testing-library/react-native';
import { AccountType, Network } from 'types/account';
import Store from 'storage/Store';
import { useSelector } from 'react-redux';
import { WalletDetailsGraph } from 'screens/WalletDetailsGraph';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));
jest.mock('@polkadot/util-crypto', () => ({
  randomAsHex: jest.fn(),
}));
jest.mock('utils/fractappClient', () => ({
  getImgUrl: jest.fn(() => 'userAvatarMock'),
  sendMsg: jest.fn(),
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view with empty txs', () => {
  const navigateMock = jest.fn();
  const store = Store.initValues();
  store.accounts.accounts[AccountType.Main] = {
    0: {
      name: 'Polkadot wallet',
      address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
      pubKey: '0x0000000000000000000',
      currency: Currency.DOT,
      network: Network.Polkadot,
      viewBalance: 123,
      balance: {
        total: '100000',
        transferable: '100000',
        payableForFee: '100000',
      },
      type: AccountType.Main,
    },
  };
  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const component = render(
    <WalletDetailsGraph
      navigation={{
        navigate: navigateMock,
      }}
      route={{
        params: {
          currency: Currency.DOT,
          type: AccountType.Main,
        },
      }}
    />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});

it('Test view with txs', () => {
  const navigateMock = jest.fn();
  const store = Store.initValues();
  store.accounts.accounts[AccountType.Main] = {
    0: {
      name: 'Polkadot wallet',
      address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
      pubKey: '0x0000000000000000000',
      currency: Currency.DOT,
      network: Network.Polkadot,
      viewBalance: 123,
      balance: {
        total: '100000',
        transferable: '100000',
        payableForFee: '100000',
      },
      type: AccountType.Main,
    },
  };
  const txs = {};
  for (let i = 0; i < 5; i++) {
    txs['id' + i] = {
      id: 'id' + i,
      hash: 'hash' + i,
      userId: null,

      address: 'address' + i,
      currency: Currency.DOT,
      action: TxAction.Transfer,
      txType: TxType.Out,
      timestamp: 10000 + i,

      value: 10 * i,
      planckValue: '10' + i,
      usdValue: 100 * i,
      fullValue: '100' + i,

      fee: 1000 * i,
      planckFee: '1000' + i,
      usdFee: 10000 * i,

      status: TxStatus.Success,
    };
  }

  store.chats.transactions[AccountType.Main] = {
    transactionById: txs,
  };

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const component = render(
    <WalletDetailsGraph
      navigation={{
        navigate: navigateMock,
      }}
      route={{
        params: {
          currency: Currency.DOT,
          type: AccountType.Main,
        },
      }}
    />,
  );
  expect(component.toJSON()).toMatchSnapshot();

  fireEvent.press(component.getByText('address0'));
  expect(navigateMock).toBeCalledWith('TransactionDetails', {
    transaction: txs.id0,
  });
});

