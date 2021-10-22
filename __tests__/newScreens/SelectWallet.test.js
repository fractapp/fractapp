import React from 'react';
import {SelectWallet} from 'screens/SelectWallet';
import {Currency} from 'types/wallet';
import {render, fireEvent} from '@testing-library/react-native';
import Store from 'storage/Store';
import { useSelector } from 'react-redux';
import { AccountType, Network } from 'types/account';

jest.mock('storage/DB', () => {});
jest.mock('react-native-crypto', () => {});
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

it('Test wallets without price', () => {
  let store = Store.initValues();

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
    1: {
      name: 'Kusama wallet',
      address: 'kusamaAddress',
      pubKey: '0x00000000000000000001123',
      currency: Currency.KSM,
      network: Network.Kusama,
      viewBalance: 321,
      balance: {
        total: '200000',
        transferable: '200000',
        payableForFee: '200000',
      },
      type: AccountType.Main,
    },
  };

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const mockFn = jest.fn();
  const route = {
    params: {
      isEditable: true,
      chatId: 'chatId',
    },
  };

  const component = render(
          <SelectWallet navigation={{navigate: mockFn}} route={route} />
    );
  expect(component.toJSON()).toMatchSnapshot();

  fireEvent.press(component.getByText(store.accounts.accounts[AccountType.Main][Currency.DOT].name));
  expect(mockFn).toBeCalledWith('Send', {
    isEditable: route.params.isEditable,
    currency: Currency.DOT,
    chatId: route.params.chatId,
  });
});

it('Test wallets with price', () => {
  let store = Store.initValues();

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
    1: {
      name: 'Kusama wallet',
      address: 'kusamaAddress',
      pubKey: '0x00000000000000000001123',
      currency: Currency.KSM,
      network: Network.Kusama,
      viewBalance: 321,
      balance: {
        total: '200000',
        transferable: '200000',
        payableForFee: '200000',
      },
      type: AccountType.Main,
    },
  };
  store.serverInfo.prices[Currency.DOT] = 124;
  store.serverInfo.prices[Currency.KSM] = 421;

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const component = render(
    <SelectWallet navigation={undefined} route={undefined} />
  );
  expect(component.toJSON()).toMatchSnapshot();
});
