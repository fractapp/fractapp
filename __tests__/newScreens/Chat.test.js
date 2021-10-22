import React from 'react';
import {Chat} from 'screens/Chat';
import { useDispatch, useSelector } from 'react-redux';
import Store  from 'storage/Store';
import { Currency } from 'types/wallet';
import { render } from '@testing-library/react-native';
import { TxAction, TxStatus, TxType } from 'types/transaction';

jest.mock('storage/DB', () => {});
jest.mock('adaptors/adaptor', () => {});
jest.mock('@polkadot/util-crypto', () => ({
  randomAsHex: jest.fn(),
}));
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('utils/api', () => {});
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

const dispatch = jest.fn();
useDispatch.mockReturnValue(dispatch);

it('Test view without messages', async () => {
  const chatId = 'chatId';

  let store = Store.initValues();
  store.chats.chatsInfo[chatId] = {
    id: chatId,
    notificationCount: 0,
    lastMsgId: null,
  };
  store.chats.chats[chatId] = {
    messages: {},
    infoById: {},
  };
  store.users.users[chatId] = {
    isAddressOnly: true,
    title: 'address#1',
    value: {
      address: 'address#1',
      currency: Currency.DOT,
    },
  };
  store.global.profile =  {
    id: 'myProfile',
    name: 'name',
    username: 'username',
    phoneNumber: 'phoneNumber',
    email: 'email',
    avatarExt: 'png',
    lastUpdate: 100,
  };

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const tree = render(
      <Chat
        navigation={{setOptions: jest.fn()}}
        route={{
          params: {
            chatId: chatId,
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test view without messages (ChatBot)', async () => {
  const chatId = 'chatId';

  let store = Store.initValues();
  store.chats.chatsInfo[chatId] = {
    id: chatId,
    notificationCount: 0,
    lastMsgId: null,
  };
  store.chats.chats[chatId] = {
    messages: {},
    infoById: {},
  };
  store.users.users[chatId] = {
    isAddressOnly: false,
    title: 'user',
    value: {
      id: 'user',
      name: 'userName',
      username: 'username#1',
      avatarExt: 'png',
      lastUpdate: 1000,
      addresses: {
        0: 'address#1',
        1: 'address#2',
      },
      isChatBot: true,
    },
  };
  store.global.profile =  {
    id: 'myProfile',
    name: 'name',
    username: 'username',
    phoneNumber: 'phoneNumber',
    email: 'email',
    avatarExt: 'png',
    lastUpdate: 100,
  };

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const tree = render(
    <Chat
      navigation={{setOptions: jest.fn()}}
      route={{
        params: {
          chatId: chatId,
        },
      }}
    />,
  )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test view with messages', async () => {
  const chatId = 'chatId';

  let store = Store.initValues();
  store.chats.chatsInfo[chatId] = {
    id: chatId,
    notificationCount: 1,
    lastMsgId: null,
  };
  store.chats.chats[chatId] = {
    messages: {
      'first': {
        id: 'first',
        value: 'hello',
        action: null,
        args: {},
        rows: [],
        timestamp: 1000,
        sender: 'sender',
        receiver: 'receiver',
        hideBtn: false,
      },
      'second': {
        id: 'second',
        value: 'tx',
        action: '/tx',
        args: {
          currency: 'DOT',
          id: 'txId',
        },
        rows: [],
        timestamp: 1000,
        sender: 'sender',
        receiver: 'receiver',
        hideBtn: false,
      },
    },
    infoById: {
      'txId': Currency.DOT,
    },
  };
  store.chats.transactions[Currency.DOT] = {
    transactionById: {
      'txId': {
        id: 'id',
        hash: 'hash',
        userId: null,

        address: 'address',
        currency: Currency.DOT,
        action: TxAction.Transfer,
        txType: TxType.Sent,
        timestamp: 100,

        value: 1000,
        planckValue: '10000000000',
        usdValue: 2000,
        fullValue: 3000,

        fee: 4000,
        planckFee: '20000000000',
        usdFee: 5000,

        status: TxStatus.Success,
      },
    },
  };
  store.users.users[chatId] = {
    isAddressOnly: true,
    title: 'address#1',
    value: {
      address: 'address#1',
      currency: Currency.DOT,
    },
  };
  store.global.profile =  {
    id: 'myProfile',
    name: 'name',
    username: 'username',
    phoneNumber: 'phoneNumber',
    email: 'email',
    avatarExt: 'png',
    lastUpdate: 100,
  };

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const tree = render(
    <Chat
      navigation={{setOptions: jest.fn()}}
      route={{
        params: {
          chatId: chatId,
        },
      }}
    />,
  ).toJSON();
  expect(tree).toMatchSnapshot();


});

/*
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


it('Test getWallet positive', () => {
  const accountsContext = AccountsStore.initialState();
  accountsContext.accounts.set(Currency.DOT, {
    name: 'accountName',
    address: 'accountAddress',
    pubKey: 'pubKeyAddress',
    currency: Currency.DOT,
    balance: 10000,
    planks: '100000000',
  });
  const priceContext = new Map([
    [
      Currency.DOT,
      1,
    ],
  ]);
  const chatsContext = ChatsStore.initialState();
  chatsContext.notificationCount = 1;

  const flatList =

  useContext.mockReturnValueOnce({
    state: accountsContext,
    dispatch: jest.fn(),
  });

  useContext.mockReturnValueOnce({
    state: priceContext,
    dispatch: jest.fn(),
  });

  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: jest.fn(),
  });
  useContext.mockReturnValue({
    state: chatsContext,
    dispatch: jest.fn(),
  });
  const navigate = jest.fn();
  const onLayout = jest.fn();
  const useRefSpy = jest.spyOn(React, 'useRef').mockReturnValueOnce({ current: { onLayout } });

  const component = render(
      <Chat
        navigation={{navigate: navigate, setOptions: jest.fn()}}
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
      />,
    );
  fireEvent.press(component.getByTestId('testGetWallet'));
  expect(component).toMatchSnapshot();
  expect(useRefSpy).toBeCalledTimes(4);//не понимаю, как протестировать onLayout 175 стр
});
*/
