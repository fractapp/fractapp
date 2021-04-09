import React from 'react';
import {SelectWallet} from 'screens/SelectWallet';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/Prices';
import {Currency, Wallet} from 'types/wallet';
import renderer from 'react-test-renderer';
import {render, fireEvent} from '@testing-library/react-native';

jest.mock('storage/DB', () => {});
jest.mock('react-native-crypto', () => {});

it('Test 0 wallets without price', () => {
  const tree = renderer
    .create(
      <AccountsStore.Context.Provider value={{state: {accounts: new Map()}}}>
        <PricesStore.Context.Provider value={{state: new Map()}}>
          <SelectWallet navigation={null} route={null} />
        </PricesStore.Context.Provider>
      </AccountsStore.Context.Provider>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test 1 wallets without price', () => {
  const accounts = new Map([
    [
      Currency.DOT,
      {
        name: 'Polkadot wallet',
        address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
        pubKey: '0x0000000000000000000',
        currency: Currency.DOT,
        balance: 10000,
        planks: '10000000',
      },
    ],
  ]);

  const tree = renderer
    .create(
      <AccountsStore.Context.Provider value={{state: {accounts: accounts}}}>
        <PricesStore.Context.Provider value={{state: new Map()}}>
          <SelectWallet navigation={null} route={null} />
        </PricesStore.Context.Provider>
      </AccountsStore.Context.Provider>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test 2 wallets without price', () => {
  const accounts = new Map([
    [
      Currency.DOT,
      {
        name: 'Polkadot wallet',
        address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
        pubKey: '0x0000000000000000000',
        currency: Currency.DOT,
        balance: 10000,
        planks: '10000000',
      },
    ],
    [
      Currency.KSM,
      {
        name: 'Kusama wallet',
        address: 'F7Zbj7rRJQLQVvQn8tKnWmSByAoFFYKYd17hSxdmYbcZzoE',
        pubKey: '0x0000000000000000000',
        currency: Currency.KSM,
        balance: 20000,
        planks: '20000000',
      },
    ],
  ]);

  const tree = renderer
    .create(
      <AccountsStore.Context.Provider value={{state: {accounts: accounts}}}>
        <PricesStore.Context.Provider value={{state: new Map()}}>
          <SelectWallet navigation={null} />
        </PricesStore.Context.Provider>
      </AccountsStore.Context.Provider>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test 1 wallets with price', () => {
  const accounts = new Map([
    [
      Currency.DOT,
      {
        name: 'Polkadot wallet',
        address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
        pubKey: '0x0000000000000000000',
        currency: Currency.DOT,
        balance: 10000,
        planks: '10000000',
      },
    ],
  ]);
  const prices = new Map([[Currency.DOT, 100]]);

  const tree = renderer
    .create(
      <AccountsStore.Context.Provider value={{state: {accounts: accounts}}}>
        <PricesStore.Context.Provider value={{state: prices}}>
          <SelectWallet navigation={null} route={null} />
        </PricesStore.Context.Provider>
      </AccountsStore.Context.Provider>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test 2 wallets with price', () => {
  const accounts = new Map([
    [
      Currency.DOT,
      {
        name: 'Polkadot wallet',
        address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
        pubKey: '0x0000000000000000000',
        currency: Currency.DOT,
        balance: 10000,
        planks: '10000000',
      },
    ],
    [
      Currency.KSM,
      {
        name: 'Kusama wallet',
        address: 'F7Zbj7rRJQLQVvQn8tKnWmSByAoFFYKYd17hSxdmYbcZzoE',
        pubKey: '0x0000000000000000000',
        currency: Currency.KSM,
        balance: 20000,
        planks: '20000000',
      },
    ],
  ]);

  const prices = new Map([
    [Currency.DOT, 100],
    [Currency.KSM, 200],
  ]);

  const tree = renderer
    .create(
      <AccountsStore.Context.Provider value={{state: {accounts: accounts}}}>
        <PricesStore.Context.Provider value={{state: prices}}>
          <SelectWallet navigation={null} route={null} />
        </PricesStore.Context.Provider>
      </AccountsStore.Context.Provider>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click start (idEditable=true)', () => {
  const accounts = new Map([
    [
      Currency.DOT,
      {
        name: 'Polkadot wallet',
        address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
        pubKey: '0x0000000000000000000',
        currency: Currency.DOT,
        balance: 10000,
        planks: '10000000',
      },
    ],
    [
      Currency.KSM,
      {
        name: 'Kusama wallet',
        address: 'F7Zbj7rRJQLQVvQn8tKnWmSByAoFFYKYd17hSxdmYbcZzoE',
        pubKey: '0x0000000000000000000',
        currency: Currency.KSM,
        balance: 20000,
        planks: '20000000',
      },
    ],
  ]);

  const prices = new Map([
    [Currency.DOT, 100],
    [Currency.KSM, 200],
  ]);

  const mockFn = jest.fn();
  const route = {
    params: {
      isEditable: true,
    },
  };
  const component = render(
    <AccountsStore.Context.Provider value={{state: {accounts: accounts}}}>
      <PricesStore.Context.Provider value={{state: prices}}>
        <SelectWallet navigation={{navigate: mockFn}} route={route} />
      </PricesStore.Context.Provider>
    </AccountsStore.Context.Provider>,
  );

  fireEvent.press(component.getByText(accounts.get(Currency.DOT)?.name));
  expect(mockFn).toBeCalledWith('Send', {
    isEditable: route.params.isEditable,
    wallet: new Wallet(
      'Polkadot wallet',
      '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
      Currency.DOT,
      10000,
      '10000000',
      100,
    ),
    chatInfo: undefined,
  });
});

it('Test click start (idEditable=null)', () => {
  const accounts = new Map([
    [
      Currency.DOT,
      {
        name: 'Polkadot wallet',
        address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
        pubKey: '0x0000000000000000000',
        currency: Currency.DOT,
        balance: 10000,
        planks: '10000000',
      },
    ],
    [
      Currency.KSM,
      {
        name: 'Kusama wallet',
        address: 'F7Zbj7rRJQLQVvQn8tKnWmSByAoFFYKYd17hSxdmYbcZzoE',
        pubKey: '0x0000000000000000000',
        currency: Currency.KSM,
        balance: 20000,
        planks: '20000000',
      },
    ],
  ]);

  const prices = new Map([
    [Currency.DOT, 100],
    [Currency.KSM, 200],
  ]);

  const mockFn = jest.fn();
  const route = {
    params: {},
  };
  const component = render(
    <AccountsStore.Context.Provider value={{state: {accounts: accounts}}}>
      <PricesStore.Context.Provider value={{state: prices}}>
        <SelectWallet navigation={{navigate: mockFn}} route={route} />
      </PricesStore.Context.Provider>
    </AccountsStore.Context.Provider>,
  );

  fireEvent.press(component.getByText(accounts.get(Currency.DOT)?.name));
  expect(mockFn).toBeCalledWith('Send', {
    isEditable: false,
    wallet: new Wallet(
      'Polkadot wallet',
      '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
      Currency.DOT,
      10000,
      '10000000',
      100,
    ),
    chatInfo: undefined,
  });
});
