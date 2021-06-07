import React, {useContext, useState} from 'react';
import renderer from 'react-test-renderer';
import {WalletDetailsGraph} from 'screens/WalletDetailsGraph';
import {Currency, Wallet} from 'types/wallet';
import GlobalStore, {initialState} from 'storage/Global';
import ChatsStore from 'storage/Chats';
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
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view with empty state', () => {
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
  });
  useContext.mockReturnValueOnce({
    state: ChatsStore.initialState(),
  });

  const wallets = [
    new Wallet(
      'Wallet Polkadot',
      'address#1',
      Currency.DOT,
      100,
      '1000000000000',
      10,
      0,
    ),
    new Wallet(
      'Wallet KSM',
      'address#2',
      Currency.KSM,
      200,
      '3000000000000',
      20,
      0,
    ),
  ];

  const tree = renderer
    .create(
      <WalletDetailsGraph
        navigation={null}
        route={{
          params: {
            wallets: wallets,
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test view with 1 wallet', () => {
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
  });
  useContext.mockReturnValueOnce({
    state: ChatsStore.initialState(),
  });

  const wallets = [
    new Wallet(
      'Wallet Polkadot',
      'address#1',
      Currency.DOT,
      100,
      '1000000000000',
      10,
      0,
    ),
  ];

  const txs = new Map();
  txs.set(Currency.DOT, {
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
  });

  const chatsState = ChatsStore.initialState();
  chatsState.transactions.set(txs.keys(), {
    transactionById: txs.values(),
  });
  useContext.mockReturnValueOnce({
    state: {
      transactions: chatsState.transactions,
      isInitialized: true,
    },
    dispatch: () => null,
  });

  const tree = renderer
    .create(
      <WalletDetailsGraph
        navigation={null}
        route={{
          params: {
            wallets: wallets,
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test view with txs', () => {
  const wallets = [
    new Wallet(
      'Wallet Polkadot',
      'address#1',
      Currency.DOT,
      100,
      '1000000000000',
      10,
      0,
    ),
    new Wallet(
      'Wallet KSM',
      'address#2',
      Currency.KSM,
      200,
      '3000000000000',
      20,
      0,
    ),
  ];

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

  const chatsState = ChatsStore.initialState();
  chatsState.transactions.set(Currency.DOT, {
    transactionById: new Map([
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
    ]),
  });
  chatsState.transactions.set(Currency.KSM, {
    transactionById: new Map([
      [
        '2',
        {
          id: '2',
          userId: 'userId',
          address: 'address#2DOT',
          currency: Currency.KSM,
          txType: TxType.Sent,
          timestamp: new Date('03-12-2020').getTime(),
          value: 10,
          usdValue: 10,
          fee: 10,
          usdFee: 10,
          status: TxStatus.Success,
        },
      ],
    ]),
  });

  useContext.mockReturnValueOnce({
    state: globalState,
    dispatch: () => null,
  });
  useContext.mockReturnValueOnce({
    state: {
      transactions: chatsState.transactions,
      isInitialized: true,
    },
    dispatch: () => null,
  });

  const tree = renderer
    .create(
      <WalletDetailsGraph
        navigation={null}
        route={{
          params: {
            wallets: wallets,
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test view click txs', () => {
  const wallets = [
    new Wallet(
      'Wallet Polkadot',
      'address#1',
      Currency.DOT,
      100,
      '1000000000000',
      10,
      1,
    ),
    new Wallet(
      'Wallet KSM',
      'address#2',
      Currency.KSM,
      200,
      '3000000000000',
      20,
      2,
    ),
  ];
  const txs = new Map();
  txs.set(Currency.DOT, {
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
  });
  txs.set(Currency.KSM, {
    id: '2',
    userId: 'userId',
    address: 'address#2KSM',
    currency: Currency.KSM,
    txType: TxType.Sent,
    timestamp: new Date('03-12-2020').getTime(),
    value: 10,
    usdValue: 10,
    fee: 10,
    usdFee: 10,
    status: TxStatus.Success,
  });


  const chatsState = ChatsStore.initialState();
  chatsState.transactions.set(Currency.DOT, {
    transactionById: new Map([
      [
        '1',
        txs.get(Currency.DOT),
      ],
    ]),
  });
  chatsState.transactions.set(Currency.KSM, {
    transactionById: new Map([
      [
        '2',
        txs.get(Currency.KSM),
      ],
    ]),
  });

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
      transactions: chatsState.transactions,
      isInitialized: true,
    },
    dispatch: () => null,
  });

  const navigate = jest.fn();
  const component = render(
    <WalletDetailsGraph
      navigation={{
        navigate: navigate,
      }}
      route={{
        params: {
          wallets: wallets,
        },
      }}
    />,
  );
  fireEvent.press(component.getByText('address#1'));
  expect(navigate).toBeCalledWith('TransactionDetails', {
    transaction: txs.get(Currency.DOT),
    wallet: wallets[txs.get(Currency.DOT).currency],
    user: null,
  });

  fireEvent.press(component.getByText('name'));
  expect(navigate).toBeCalledWith('TransactionDetails', {
    transaction: txs.get(Currency.KSM),
    wallet: wallets[txs.get(Currency.KSM).currency],
    user: globalState.users.get('userId'),
  });
});

