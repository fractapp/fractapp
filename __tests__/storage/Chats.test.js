import {useContext, useState} from 'react';
import ChatsStore from 'storage/Chats';
import Chats from 'storage/Chats';
import DB from 'storage/DB';
import {Transaction, TxStatus, TxType} from 'types/transaction';
import {Currency} from 'types/wallet';

jest.mock('storage/DB', () => ({
  setChatsState: jest.fn(),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
  useState: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));
useState.mockImplementation((init) => [init, jest.fn()]);

const chatsState = {
  chats: new Map(),
  chatsInfo: new Map(),
  transactions: new Map(),
  pendingTransactions: new Map(),
  sentFromFractapp: new Map(),
  totalNotifications: 1,
  isInitialized: true,
};
const prevState = {
  chats: new Map(),
  chatsInfo: new Map(),
  transactions: new Map(),
  pendingTransactions: new Map(),
  sentFromFractapp: new Map(),
  totalNotifications: 0,
  isInitialized: false,
};
const tx = {
  id: 'id',
  hash: 'hash',
  userId: 'userId',
  address: 'address#1',
  currency: Currency.DOT,
  txType: TxType.None,
  timestamp: 1000,
  value: 100,
  planckValue: '100000',
  usdValue: 12,
  fee: 100,
  planckFee: '1000',
  usdFee: 12,
  status: TxStatus.Pending,
};
const user = {
  id: 'userId',
  name: 'name',
  username: 'username',
  avatarExt: 'url',
  lastUpdate: '0',
  addresses: {
    0: 'address#1',
    1: 'address#2KSM',
  },
};
const isNotify = true;
const txId = '0';
const status = TxStatus.Pending;
const currency = Currency.DOT;
const index = 0;

it('Test set', async () => {
  expect(Chats.set(chatsState)).toStrictEqual({
    type: Chats.Action.SET,
    state: chatsState,
  });
});

it('Test addTx', async () => {
  expect(Chats.addTx(tx, isNotify, user)).toStrictEqual({
    type: Chats.Action.ADD_TX,
    tx: tx,
    user: user,
    isNotify: isNotify,
  });
});

it('Test confirmPendingTx', async () => {
  expect(Chats.confirmPendingTx(txId, status, currency, index)).toStrictEqual({
    type: Chats.Action.CONFIRM_PENDING_TX,
    txId: txId,
    status: status,
    currency: currency,
    index: index,
  });
});

it('Test removeNotification', async () => {
  const id = '0';
  expect(Chats.removeNotification(id)).toStrictEqual({
    type: Chats.Action.REMOVE_NOTIFICATION,
    chatId: id,
  });
});

it('Test renameChat', async () => {
  const id = '0';
  const newName = 'newname';

  expect(Chats.renameChat(id, newName)).toStrictEqual({
    type: Chats.Action.RENAME_CHAT,
    chatId: '0',
    name: newName,
  });
});

it('Test reducer SET', async () => {
  const state = ChatsStore.initialState();
  useContext.mockReturnValueOnce({
    state: state,
    dispatch: jest.fn(),
  });
  expect(
    Chats.reducer(prevState, {type: Chats.Action.SET, state: chatsState}),
  ).toStrictEqual(chatsState);
});

it('Test reducer ADD_PENDING_TX', async () => {
  const state = ChatsStore.initialState();
  useContext.mockReturnValueOnce({
    state: state,
    dispatch: jest.fn(),
  });
  expect(
    Chats.reducer(state, {
      type: Chats.Action.ADD_PENDING_TX,
      state: chatsState,
      tx: tx,
      user: user,
    }),
  ).toMatchSnapshot();
});

it('Test reducer ADD_TX negative', async () => {
  const state = ChatsStore.initialState();
  useContext.mockReturnValueOnce({
    state: state,
    dispatch: jest.fn(),
  });

  expect(
    Chats.reducer(state, {
      type: Chats.Action.ADD_TX,
      isNotify: isNotify,
      tx: tx,
      user: user,
    }),
  ).toMatchSnapshot();
});

it('Test reducer ADD_TX positive', async () => {
  const state = ChatsStore.initialState();

  state.chatsInfo = new Map([
    [
      'userId',
      {
        id: '0',
        name: 'name',
        lastTxId: 'id1',
        lastTxCurrency: Currency.DOT,
        notificationCount: 1,
        timestamp: 10,
        type: 0,
        details: null,
      },
    ],
  ]);

  const txById = new Map([
    [
      'id1',
      {
        id: 'id',
        hash: 'hash',
        userId: 'userId',
        address: 'address#1',
        currency: Currency.DOT,
        txType: TxType.None,
        timestamp: 11,
        value: 100,
        planckValue: '111111',
        usdValue: 11,
        fee: 111,
        planckFee: '11',
        usdFee: 11,
        status: TxStatus.Pending,
      },
    ],
  ]);

  state.transactions = new Map([
    [
      Currency.DOT,
      {
        transactionById: txById,
      },
    ],
  ]);

  useContext.mockReturnValueOnce({
    state: state,
    dispatch: jest.fn(),
  });

  expect(
    Chats.reducer(state, {
      type: Chats.Action.ADD_TX,
      isNotify: isNotify,
      tx: tx,
      user: user,
    }),
  ).toMatchSnapshot();
});

it('Test reducer CONFIRM_PENDING_TX', async () => {
  const state = ChatsStore.initialState();

  const txById = new Map([
    [
      '0',
      {
        id: 'id',
        hash: 'hash',
        userId: 'userId',
        address: 'address#1',
        currency: Currency.DOT,
        txType: TxType.None,
        timestamp: 11,
        value: 100,
        planckValue: '111111',
        usdValue: 11,
        fee: 111,
        planckFee: '11',
        usdFee: 11,
        status: TxStatus.Pending,
      },
    ],
  ]);

  state.transactions = new Map([
    [
      Currency.DOT,
      {
        transactionById: txById,
      },
    ],
  ]);

  const idsOfTxs = ['0', '1', '2'];

  state.pendingTransactions = new Map([
    [
      Currency.DOT,
      {
        idsOfTransactions: idsOfTxs,
      },
    ],
  ]);

  useContext.mockReturnValueOnce({
    state: state,
    dispatch: jest.fn(),
  });

  expect(
    Chats.reducer(state, {
      type: Chats.Action.CONFIRM_PENDING_TX,
      txId: '0',
      currency: Currency.DOT,
      status: status,
      index: 0,
    }),
  ).toMatchSnapshot();
});

it('Test reducer REMOVE_NOTIFICATION', async () => {
  const state = ChatsStore.initialState();
  const id = '0';
  state.chatsInfo = new Map([
    [
      '0',
      {
        id: '0',
        name: 'name',
        lastTxId: 'id1',
        lastTxCurrency: Currency.DOT,
        notificationCount: 1,
        timestamp: 10,
        type: 0,
        details: null,
      },
    ],
  ]);
  useContext.mockReturnValueOnce({
    state: state,
    dispatch: jest.fn(),
  });
  expect(
    Chats.reducer(state, {
      type: Chats.Action.REMOVE_NOTIFICATION,
      chatId: id,
    }),
  ).toMatchSnapshot();
});

it('Test reducer RENAME_CHAT', async () => {
  const state = ChatsStore.initialState();
  const id = '0';
  state.chatsInfo = new Map([
    [
      '0',
      {
        id: '0',
        name: 'name',
        lastTxId: 'id1',
        lastTxCurrency: Currency.DOT,
        notificationCount: 1,
        timestamp: 10,
        type: 0,
        details: null,
      },
    ],
  ]);
  useContext.mockReturnValueOnce({
    state: state,
    dispatch: jest.fn(),
  });
  expect(
    Chats.reducer(state, {
      type: Chats.Action.RENAME_CHAT,
      chatId: id,
      name: 'name1',
    }),
  ).toMatchSnapshot();
});

it('Test reducer default', async () => {
  const state = ChatsStore.initialState();
  useContext.mockReturnValueOnce({
    state: state,
    dispatch: jest.fn(),
  });
  expect(
    Chats.reducer(state, {}),
  ).toMatchSnapshot();
});
