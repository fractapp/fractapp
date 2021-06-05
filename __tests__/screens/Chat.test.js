import React, {useContext, useState} from 'react';
import renderer from 'react-test-renderer';
import {Chat} from 'screens/Chat';
import {Currency} from 'types/wallet';
import {ChatType} from 'types/chatInfo';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/Prices';
import GlobalStore from 'storage/Global';
import ChatsStore from 'storage/Chats';
import {TxStatus, TxType} from 'types/transaction';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
  useState: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));
jest.mock('utils/backend', () => {});
jest.mock('utils/math', () => ({
  floorUsd: jest.fn(() => 0.123),
}));

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view with empty txs', () => {
  useContext.mockReturnValueOnce({
    state: AccountsStore.initialState(),
    dispatch: jest.fn(),
  });
  useContext.mockReturnValueOnce({
    state: PricesStore.initialState(),
    dispatch: jest.fn(),
  });
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: jest.fn(),
  });
  useContext.mockReturnValueOnce({
    state: ChatsStore.initialState(),
    dispatch: jest.fn(),
  });

  const tree = renderer
    .create(
      <Chat
        navigation={{setOptions: jest.fn()}}
        route={{
          params: {
            chatInfo: {
              id: 'idChatInfo',
              name: 'name',
              lastTxId: 'lastTxId',
              lastTxCurrency: Currency.DOT,
              notificationCount: 10,
              timestamp: new Date().getTime(),
              type: ChatType.AddressOnly,
              details: {
                currency: Currency.DOT,
                address: 'address',
              },
            },
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test view with txs (ChatType == Address)', () => {
  const accountsStore = AccountsStore.initialState();
  accountsStore.accounts.set(Currency.DOT, {
      name: 'accountName',
      address: 'accountAddress',
      pubKey: 'pubKeyAddress',
      currency: Currency.DOT,
      balance: 10000,
      planks: '100000000',
    },
  );
  useContext.mockReturnValueOnce({
    state: accountsStore,
    dispatch: jest.fn(),
  });

  useContext.mockReturnValueOnce({
    state: PricesStore.initialState(),
    dispatch: jest.fn(),
  });

  const globalState = GlobalStore.initialState();
  useContext.mockReturnValueOnce({
    state: globalState,
    dispatch: jest.fn(),
  });

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
        userId: null,
        address: 'address#1',
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

  const infoById = new Map([
    [
      '1',
      {currency: Currency.DOT}
    ],
    [
      '2',
      {currency: Currency.DOT}
    ]
  ]);

  const chatsState = ChatsStore.initialState();
  chatsState.chats.set(
    'idChatInfo',
    {infoById: infoById.get('1')},
  );
  chatsState.chats.set(
    'idChatInfo',
    {infoById: infoById.get('2')},
  );
  chatsState.transactions.set(Currency.DOT, {
    transactionById: new Map([[
      '1',
      txs.get('1'),
    ]])}    
  );
  chatsState.transactions.set(Currency.DOT, {
    transactionById: new Map([[
      '2',
      txs.get('2'),
    ]])}    
  );
  useContext.mockReturnValueOnce({
    state: chatsState,
    dispatch: jest.fn(),
  });

  useContext.mockReturnValueOnce({
    state: {
      transactions: chatsState.transactions,
      isInitialized: true,
    },
    dispatch: jest.fn(),
  });

  const tree = renderer
    .create(
      <Chat
        navigation={{setOptions: jest.fn()}}
        route={{
          params: {
            chatInfo: {
              id: 'idChatInfo',
              name: 'name',
              lastTxId: 'lastTxId',
              lastTxCurrency: Currency.DOT,
              notificationCount: 1,
              timestamp: new Date().getTime(),
              type: ChatType.AddressOnly,
              details: {
                currency: Currency.DOT,
                address: 'address',
              },
            },
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
