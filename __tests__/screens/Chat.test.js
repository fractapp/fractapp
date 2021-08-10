import React, {useContext} from 'react';
import renderer from 'react-test-renderer';
import {Chat} from 'screens/Chat';
import {Currency} from 'types/wallet';
import { ChatType } from 'types/chatInfo';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/ServerInfo';
import GlobalStore from 'storage/Global';
import ChatsStore from 'storage/Chats';
import {TxStatus, TxType} from 'types/transaction';
import { render } from '@testing-library/react-native';
import { ConfirmCode } from 'screens/ConfirmCode';
import BackendApi from 'utils/api';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));
jest.mock('utils/backend', () => {});
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

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

it('Test view with txs (ChatType == Address)', async () => {
  const accountsStore = AccountsStore.initialState();
  accountsStore.accounts.set(Currency.DOT, {
    name: 'accountName',
    address: 'accountAddress',
    pubKey: 'pubKeyAddress',
    currency: Currency.DOT,
    balance: 10000,
    planks: '100000000',
  });
  useContext.mockReturnValueOnce({
    state: accountsStore,
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

  const chatsState = ChatsStore.initialState();

  chatsState.chats.set('idChatInfo#1', {infoById: new Map([
      ['1', {currency: Currency.DOT}],
      ['2', {currency: Currency.DOT}],
    ])});

  chatsState.transactions.set(Currency.DOT, {
    transactionById: new Map([
      [
        '1',
        {
          id: '1',
          hash: 'hash#1',
          userId: null,
          address: 'address#1',
          currency: Currency.DOT,
          txType: TxType.Sent,
          timestamp: new Date('02-12-2020').getTime(),
          value: 12,
          usdValue: 12,
          planckValue: '1000000',
          fee: 1,
          planckFee: '10000000',
          status: TxStatus.Fail,
          usdFee: 12,
        },
      ],
      [
        '2',
        {
          id: '2',
          hash: 'hash#2',
          userId: null,
          address: 'address#2',
          currency: Currency.DOT,
          txType: TxType.Received,
          timestamp: new Date('02-12-2020').getTime(),
          value: 13,
          usdValue: 13,
          planckValue: '1000000',
          fee: 2,
          planckFee: '10000000',
          status: TxStatus.Success,
          usdFee: 13,
        },
      ],
    ]),
  });

  useContext.mockReturnValue({
    state: chatsState,
    dispatch: jest.fn(),
  });

  const component = await render(
    <Chat
      navigation={{setOptions: jest.fn()}}
      route={{
        params: {
          chatInfo: {
            id: 'idChatInfo#1',
            name: 'name',
            lastTxId: '2',
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
    />
  );
  expect(component.toJSON()).toMatchSnapshot();
});
