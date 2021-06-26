import React, {useContext, useState} from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import {Send} from 'screens/Send';
import {Network} from 'types/account';
import {Currency, Wallet} from 'types/wallet';
import { Adaptors } from 'adaptors/adaptor';
import { ChatType } from 'types/chatInfo';
import GlobalStore from 'storage/Global';
import BackendApi from 'utils/backend';
import BN from 'bn.js';
import DialogStore from 'storage/Dialog';

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
  getImgUrl: jest.fn(),
  getUserById: jest.fn(),
}));
jest.mock('utils/tasks', () => {});

jest.mock('@polkadot/util-crypto', () => {});
jest.mock('adaptors/adaptor', () => ({
  Adaptors: {
    get: jest.fn(),
  },
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view 1', async () => {
  const ApiMock = {
    init: jest.fn(),
  };
  await Adaptors.get.mockReturnValue(ApiMock);
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: jest.fn(),
  });
  const tree = await render(
      <Send
        navigation={null}
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
            isEditable: false,
          },
        }}
      />,
    ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test view 2', async () => {
  const ApiMock = {
    init: jest.fn(),
  };
  await Adaptors.get.mockReturnValue(ApiMock);
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: jest.fn(),
  });
  const tree = await render(
      <Send
        navigation={null}
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
            isEditable: true,
          },
        }}
      />,
    ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test chatInfo WithUser 1', async () => {
  const ApiMock = {
    init: jest.fn(),
  };
  await Adaptors.get.mockReturnValue(ApiMock);
  await BackendApi.getUserById.mockReturnValueOnce(undefined);

  const globalContext = {
    users: new Map([
      [
        'id',
        {
          id: 'id',
          name: 'name',
          username: 'username',
          avatarExt: 'avatarExt',
          lastUpdate: 1,
          addresses: {
            0: 'address1',
            1: 'address2',
          },
        },
      ],
    ]),
  };
  const dialogContext = {
    close: jest.fn(),
  };

  useContext.mockReturnValueOnce({
    state: globalContext,
    dispatch: jest.fn(),
  });
  useContext.mockReturnValueOnce({
    state: dialogContext,
    dispatch: jest.fn(),
  });
  const tree = await render(
      <Send
        navigation={null}
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
            chatInfo: {
              id: 'id',
              name: 'name',
              lastTxId: 'lastTxId',
              lastTxCurrency: Currency.DOT,
              notificationCount: 1,
              timestamp: 1,
              type: 1,
              details: null,
            },
            isEditable: false,
          },
        }}
      />,
    ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test chatInfo WithUser 2', async () => {
  const ApiMock = {
    init: jest.fn(),
  };
  await Adaptors.get.mockReturnValue(ApiMock);
  await BackendApi.getUserById.mockReturnValueOnce(null);

  const state = {
    users: new Map([
      [
        'id',
        {
          id: 'id',
          name: 'name',
          username: 'username',
          avatarExt: 'avatarExt',
          lastUpdate: 1,
          addresses: {
            0: 'address1',
            1: 'address2',
          },
        },
      ],
    ]),
  };

  useContext.mockReturnValueOnce({
    state: state,
    dispatch: jest.fn(),
  });
  const tree = await render(
      <Send
        navigation={null}
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
            chatInfo: {
              id: 'id',
              name: 'name',
              lastTxId: 'lastTxId',
              lastTxCurrency: Currency.DOT,
              notificationCount: 1,
              timestamp: 1,
              type: 1,
              details: null,
            },
            isEditable: false,
          },
        }}
      />,
    ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test chatInfo AddressOnly', async () => {
  const ApiMock = {
    init: jest.fn(),
  };
  await Adaptors.get.mockReturnValue(ApiMock);
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: jest.fn(),
  });
  const tree = await render(
      <Send
        navigation={null}
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
            chatInfo: {
              id: 'id',
              name: 'name',
              lastTxId: 'lastTxId',
              lastTxCurrency: Currency.DOT,
              notificationCount: 1,
              timestamp: 1,
              type: 0,
              details: null,
            },
            isEditable: false,
          },
        }}
      />,
    ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test send 1', async () => {
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: jest.fn(),
  });
  const tree = await render(
    <Send
      navigation={null}
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
          chatInfo: {
            id: 'id',
            name: 'name',
            lastTxId: 'lastTxId',
            lastTxCurrency: Currency.DOT,
            notificationCount: 1,
            timestamp: 1,
            type: 0,
            details: null,
          },
          isEditable: false,
          usdValue: 0,
          usdFee: 0,
        },
      }}
    />,
  );
  fireEvent.press(tree.getByText('send_btn'));
  expect(tree).toMatchSnapshot();
});

it('Test send 2', async () => {
  const globalContext = {
    setLoading: jest.fn(),
  };
  useContext.mockReturnValueOnce({
    state: globalContext,
    dispatch: jest.fn(),
  });
  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [new BN(1), jest.fn()])
    .mockImplementationOnce((init) => ['1', jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [true, jest.fn()]);

    const ApiMock = {
      init: jest.fn(),
      send: jest.fn(() => 'hash'),
    };
    await Adaptors.get.mockReturnValue(ApiMock);
  const tree = await render(
    <Send
      navigation={null}
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
          chatInfo: {
            id: 'id',
            name: 'name',
            lastTxId: 'lastTxId',
            lastTxCurrency: Currency.DOT,
            notificationCount: 1,
            timestamp: 1,
            type: 0,
            details: null,
          },
          isEditable: false,
          usdValue: 0,
          usdFee: 0,
          planksFee: '1',
          planksValue: '1',
          value: '50',
        },
      }}
    />,
  );
  fireEvent.press(tree.getByText('send_btn'));
  expect(tree).toMatchSnapshot();
});


