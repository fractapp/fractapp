import React from 'react';
import {Wallets} from 'screens/Wallets';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/Prices';
import {Currency, Wallet} from 'models/wallet';
import renderer from 'react-test-renderer';
import {Account} from 'models/account';
import {render, fireEvent, act} from '@testing-library/react-native';

it('Test 0 wallets without price', () => {
  const tree = renderer
    .create(
      <AccountsStore.Context.Provider value={{accounts: new Map()}}>
        <PricesStore.Context.Provider
          value={{prices: new Map<Currency, number>()}}>
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
      Currency.Polkadot,
      new Account(
        'Polkadot wallet',
        '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
        '0x0000000000000000000',
        Currency.Polkadot,
        1000,
      ),
    ],
  ]);

  const tree = renderer
    .create(
      <AccountsStore.Context.Provider value={{accounts: accounts}}>
        <PricesStore.Context.Provider
          value={{prices: new Map<Currency, number>()}}>
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
      Currency.Polkadot,
      new Account(
        'Polkadot wallet',
        '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
        '0x0000000000000000000',
        Currency.Polkadot,
        1000,
      ),
    ],
    [
      Currency.Kusama,
      new Account(
        'Kusama wallet',
        'F7Zbj7rRJQLQVvQn8tKnWmSByAoFFYKYd17hSxdmYbcZzoE',
        '0x0000000000000000000',
        Currency.Kusama,
        2000,
      ),
    ],
  ]);

  const tree = renderer
    .create(
      <AccountsStore.Context.Provider value={{accounts: accounts}}>
        <PricesStore.Context.Provider
          value={{prices: new Map<Currency, number>()}}>
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
      Currency.Polkadot,
      new Account(
        'Polkadot wallet',
        '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
        '0x0000000000000000000',
        Currency.Polkadot,
        1000,
      ),
    ],
  ]);
  const prices = new Map([[Currency.Polkadot, 100]]);

  const tree = renderer
    .create(
      <AccountsStore.Context.Provider value={{accounts: accounts}}>
        <PricesStore.Context.Provider value={{prices: prices}}>
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
      Currency.Polkadot,
      new Account(
        'Polkadot wallet',
        '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
        '0x0000000000000000000',
        Currency.Polkadot,
        1000,
      ),
    ],
    [
      Currency.Kusama,
      new Account(
        'Kusama wallet',
        'F7Zbj7rRJQLQVvQn8tKnWmSByAoFFYKYd17hSxdmYbcZzoE',
        '0x0000000000000000000',
        Currency.Kusama,
        2000,
      ),
    ],
  ]);

  const prices = new Map([
    [Currency.Polkadot, 100],
    [Currency.Kusama, 200],
  ]);

  const tree = renderer
    .create(
      <AccountsStore.Context.Provider value={{accounts: accounts}}>
        <PricesStore.Context.Provider value={{prices: prices}}>
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
      Currency.Polkadot,
      new Account(
        'Polkadot wallet',
        '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
        '0x0000000000000000000',
        Currency.Polkadot,
        1000,
      ),
    ],
    [
      Currency.Kusama,
      new Account(
        'Kusama wallet',
        'F7Zbj7rRJQLQVvQn8tKnWmSByAoFFYKYd17hSxdmYbcZzoE',
        '0x0000000000000000000',
        Currency.Kusama,
        2000,
      ),
    ],
  ]);

  const prices = new Map([
    [Currency.Polkadot, 100],
    [Currency.Kusama, 200],
  ]);

  const mockFn = jest.fn();

  const component = render(
    <AccountsStore.Context.Provider value={{accounts: accounts}}>
      <PricesStore.Context.Provider value={{prices: prices}}>
        <Wallets navigation={{navigate: mockFn}} />
      </PricesStore.Context.Provider>
    </AccountsStore.Context.Provider>,
  );

  const polkadotWallet = accounts.get(Currency.Polkadot);
  fireEvent.press(component.getByText(accounts.get(Currency.Polkadot)?.name));
  expect(mockFn).toBeCalledWith('WalletDetails', {
    wallet: new Wallet(
      polkadotWallet?.name,
      polkadotWallet?.address,
      polkadotWallet?.currency,
      polkadotWallet?.balance,
      prices.get(Currency.Polkadot),
    ),
  });

  const kusamaWallet = accounts.get(Currency.Kusama);
  fireEvent.press(component.getByText(kusamaWallet?.name));
  expect(mockFn).toBeCalledWith('WalletDetails', {
    wallet: new Wallet(
      kusamaWallet?.name,
      kusamaWallet?.address,
      kusamaWallet?.currency,
      kusamaWallet?.balance,
      prices.get(Currency.Kusama),
    ),
  });
});
