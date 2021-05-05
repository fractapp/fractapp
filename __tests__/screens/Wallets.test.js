import React from 'react';
import {Wallets} from 'screens/Wallets';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/Prices';
import {Currency, Wallet} from 'types/wallet';
import renderer from 'react-test-renderer';
import {render, fireEvent} from '@testing-library/react-native';

jest.mock('storage/DB', () => {});

it('Test 0 wallets without price', () => {
  const tree = renderer
    .create(
      <AccountsStore.Context.Provider value={{state: {accounts: new Map()}}}>
        <PricesStore.Context.Provider value={{state: new Map()}}>
          <Wallets navigation={null} />
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
          <Wallets navigation={null} />
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
          <Wallets navigation={null} />
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
          <Wallets navigation={null} />
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
          <Wallets navigation={null} />
        </PricesStore.Context.Provider>
      </AccountsStore.Context.Provider>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click start', () => {
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

  const component = render(
    <AccountsStore.Context.Provider value={{state: {accounts: accounts}}}>
      <PricesStore.Context.Provider value={{state: prices}}>
        <Wallets navigation={{navigate: mockFn}} />
      </PricesStore.Context.Provider>
    </AccountsStore.Context.Provider>,
  );

  const polkadotWallet = accounts.get(Currency.DOT);
  fireEvent.press(component.getByText(accounts.get(Currency.DOT)?.name));
  expect(mockFn).toBeCalledWith('WalletDetails', {
    wallet: new Wallet(
      polkadotWallet?.name,
      polkadotWallet?.address,
      polkadotWallet?.currency,
      polkadotWallet?.balance,
      '10000000',
      prices.get(Currency.DOT),
    ),
  });

  const kusamaWallet = accounts.get(Currency.KSM);
  fireEvent.press(component.getByText(kusamaWallet?.name));
  expect(mockFn).toBeCalledWith('WalletDetails', {
    wallet: new Wallet(
      kusamaWallet?.name,
      kusamaWallet?.address,
      kusamaWallet?.currency,
      kusamaWallet?.balance,
      '20000000',
      prices.get(Currency.KSM),
    ),
  });
});
