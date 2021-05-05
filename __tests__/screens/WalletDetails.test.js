import React, {useContext, useState} from 'react';
import renderer from 'react-test-renderer';
import {WalletDetails} from 'screens/WalletDetails';
import {Currency, Wallet} from 'types/wallet';
import GlobalStore, {initialState} from 'storage/Global';
import TransactionsStore from 'storage/Transactions';
import {TxStatus, TxType} from 'types/transaction';
import {fireEvent, render} from '@testing-library/react-native';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useContext: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));
jest.mock('utils/backend', () => ({
  getImgUrl: jest.fn(() => 'userAvatarMock'),
}));

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view with empty state', () => {
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
  });
  useContext.mockReturnValueOnce({
    state: TransactionsStore.initialState(),
  });

  const tree = renderer
    .create(
      <WalletDetails
        navigation={null}
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
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test view with txs', () => {
  const txs = new Map([
    [
      '1',
      {
        id: '1',
        userId: null,
        address: 'address#1',
        currency: Currency.DOT,
        txType: TxType.Sent,
        timestamp: new Date('02-12-2020').getTime(),
        value: 12,
        usdValue: 12,
        fee: 12,
        usdFee: 12,
        status: TxStatus.Fail,
      },
    ],
    [
      '2',
      {
        id: '2',
        userId: 'userId',
        address: 'address#2DOT',
        currency: Currency.DOT,
        txType: TxType.Sent,
        timestamp: new Date('03-12-2020').getTime(),
        value: 10,
        usdValue: 10,
        fee: 10,
        usdFee: 10,
        status: TxStatus.Success,
      },
    ],
  ]);
  const globalState = GlobalStore.initialState();
  globalState.users.set('userId', {
    id: 'id',
    name: 'name',
    username: 'username',
    avatarExt: 'png',
    lastUpdate: new Date('12-12-2020').getTime(),
    addresses: {
      0: 'address#2DOT',
      1: 'address#2KSM',
    },
  });
  useContext.mockReturnValueOnce({
    state: globalState,
    dispatch: () => null,
  });
  useContext.mockReturnValueOnce({
    state: {
      transactions: new Map([[Currency.DOT, txs]]),
      isInitialized: true,
    },
    dispatch: () => null,
  });

  const tree = renderer
    .create(
      <WalletDetails
        navigation={null}
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
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test view click send', () => {
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
  });
  useContext.mockReturnValueOnce({
    state: TransactionsStore.initialState(),
  });

  const wallet = new Wallet(
    'Wallet Polkadot',
    'address#1',
    Currency.DOT,
    100,
    '1000000000000',
    10,
  );
  const navigate = jest.fn();
  const component = render(
    <WalletDetails
      navigation={{
        navigate: navigate,
      }}
      route={{
        params: {
          wallet: wallet,
        },
      }}
    />,
  );

  fireEvent.press(component.getByTestId('sendBtn'));
  expect(navigate).toBeCalledWith('Search', {
    wallet: wallet,
  });
});

it('Test view click receive', () => {
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
  });
  useContext.mockReturnValueOnce({
    state: TransactionsStore.initialState(),
  });

  const wallet = new Wallet(
    'Wallet Polkadot',
    'address#1',
    Currency.DOT,
    100,
    '1000000000000',
    10,
  );
  const navigate = jest.fn();
  const component = render(
    <WalletDetails
      navigation={{
        navigate: navigate,
      }}
      route={{
        params: {
          wallet: wallet,
        },
      }}
    />,
  );

  fireEvent.press(component.getByTestId('receiveBtn'));
  expect(navigate).toBeCalledWith('Receive', {
    address: wallet.address,
    currency: wallet.currency,
  });
});

it('Test view click txs', () => {
  const txs = new Map([
    [
      '1',
      {
        id: '1',
        userId: null,
        address: 'address#1',
        currency: Currency.DOT,
        txType: TxType.Sent,
        timestamp: new Date('02-12-2020').getTime(),
        value: 12,
        usdValue: 12,
        fee: 12,
        usdFee: 12,
        status: TxStatus.Fail,
      },
    ],
    [
      '2',
      {
        id: '2',
        userId: 'userId',
        address: 'address#2DOT',
        currency: Currency.DOT,
        txType: TxType.Sent,
        timestamp: new Date('03-12-2020').getTime(),
        value: 10,
        usdValue: 10,
        fee: 10,
        usdFee: 10,
        status: TxStatus.Success,
      },
    ],
  ]);
  const globalState = GlobalStore.initialState();
  globalState.users.set('userId', {
    id: 'id',
    name: 'name',
    username: 'username',
    avatarExt: 'png',
    lastUpdate: new Date('12-12-2020').getTime(),
    addresses: {
      0: 'address#2DOT',
      1: 'address#2KSM',
    },
  });
  useContext.mockReturnValueOnce({
    state: globalState,
    dispatch: () => null,
  });
  useContext.mockReturnValueOnce({
    state: {
      transactions: new Map([[Currency.DOT, txs]]),
      isInitialized: true,
    },
    dispatch: () => null,
  });

  const wallet = new Wallet(
    'Wallet Polkadot',
    'address#1',
    Currency.DOT,
    100,
    '1000000000000',
    10,
  );
  const navigate = jest.fn();
  const component = render(
    <WalletDetails
      navigation={{
        navigate: navigate,
      }}
      route={{
        params: {
          wallet: wallet,
        },
      }}
    />,
  );

  fireEvent.press(component.getByText('address#1'));
  expect(navigate).toBeCalledWith('TransactionDetails', {
    transaction: txs.get('1'),
    wallet: wallet,
    user: null,
  });

  fireEvent.press(component.getByText('name'));
  expect(navigate).toBeCalledWith('TransactionDetails', {
    transaction: txs.get('2'),
    wallet: wallet,
    user: globalState.users.get('userId'),
  });
});
