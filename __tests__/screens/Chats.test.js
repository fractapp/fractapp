import React, {useContext, useState} from 'react';
import renderer from 'react-test-renderer';
import {Chats} from 'screens/Chats';
import ChatsStore from 'storage/Chats';
import GlobalStore from 'storage/Global';
import {Currency} from 'types/wallet';
import {ChatType, DefaultDetails} from 'types/chatInfo';
import {TxStatus, TxType} from 'types/transaction';
import StringUtils from 'utils/string';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
  useState: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));
jest.mock('utils/backend', () => ({
  getImgUrl: jest.fn(),
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view empty', () => {
  useContext.mockReturnValueOnce({
    state: ChatsStore.initialState(),
  });
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
  });
  const tree = renderer
    .create(
      <Chats
        navigation={{
          setOptions: jest.fn(),
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test view with chats', () => {
  const chats = ChatsStore.initialState();
  chats.chatsInfo.set('chatOne', {
    id: 'chatOne',
    name: 'address#1',
    lastTxId: 'txOne',
    lastTxCurrency: Currency.DOT,
    notificationCount: 15,
    timestamp: 123123,
    type: ChatType.AddressOnly,
    details: {
      currency: Currency.DOT,
      address: 'address#1',
    },
  });
  chats.chatsInfo.set('chatTwo', {
    id: 'chatTwo',
    name: 'username',
    lastTxId: 'txTwo',
    lastTxCurrency: Currency.KSM,
    notificationCount: 12,
    timestamp: 222111,
    type: ChatType.WithUser,
    details: {
      currency: Currency.KSM,
      address: 'address#2',
    },
  });

  chats.transactions.set(Currency.DOT, {
    transactionById: new Map([
      [
        'txOne',
        {
          id: 'txOne',
          userId: null,
          address: 'address#1',
          currency: Currency.DOT,
          txType: TxType.Sent,
          timestamp: 12123,
          value: 10000,
          usdValue: 10001,
          fee: 10002,
          usdFee: 10003,
          status: TxStatus.Success,
        },
      ],
    ]),
  });
  chats.transactions.set(Currency.KSM, {
    transactionById: new Map([
      [
        'txTwo',
        {
          id: 'txTwo',
          userId: 'userId',
          address: 'address#2',
          currency: Currency.KSM,
          txType: TxType.Sent,
          timestamp: 121235,
          value: 100005,
          usdValue: 100015,
          fee: 100025,
          usdFee: 100035,
          status: TxStatus.Success,
        },
      ],
    ]),
  });

  useContext.mockReturnValueOnce({
    state: chats,
    dispatch: () => null,
  });

  const global = GlobalStore.initialState();
  global.users.set('userId', {
    id: 'userId',
    name: 'name',
    username: 'username',
    avatarExt: 'png',
    lastUpdate: 5555,
    addresses: {
      0: 'addressDOT',
      1: 'addressKSM',
    },
  });
  useContext.mockReturnValueOnce({
    state: global,
    dispatch: () => null,
  });

  const tree = renderer
    .create(
      <Chats
        navigation={{
          setOptions: jest.fn(),
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
