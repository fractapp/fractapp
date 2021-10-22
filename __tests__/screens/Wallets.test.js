import React from 'react';
import {Wallets} from 'screens/Wallets';
import AccountsStore from 'storage/Accounts';
import PricesStore from 'storage/ServerInfo';
import {Currency, Wallet} from 'types/wallet';
import renderer from 'react-test-renderer';
import {render, fireEvent} from '@testing-library/react-native';
import Store from 'storage/Store';
import { AccountType, Network } from 'types/account';
import { useSelector } from 'react-redux';

jest.mock('storage/DB', () => {});
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

  store.accounts.accounts[AccountType.Staking] = {
    0: {
      name: 'Polkadot staking',
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
      name: 'Kusama staking',
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

  const navMock = jest.fn();
  const component = render(
          <Wallets navigation={{
            navigate: navMock,
          }} />
  );
  expect(component.toJSON()).toMatchSnapshot();

  const polkadotWallet = store.accounts.accounts[AccountType.Main][Currency.DOT];
  fireEvent.press(component.getByText(polkadotWallet.name));
  expect(navMock).toBeCalledWith('WalletDetails', {
    currency: polkadotWallet.currency,
    type: polkadotWallet.type,
  });

  const kusamaStakingWallet = store.accounts.accounts[AccountType.Staking][Currency.KSM];
  fireEvent.press(component.getByText(kusamaStakingWallet?.name));
  expect(navMock).toBeCalledWith('WalletDetails', {
    currency: kusamaStakingWallet.currency,
    type: kusamaStakingWallet.type,
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

  store.accounts.accounts[AccountType.Staking] = {
    0: {
      name: 'Polkadot staking',
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
      name: 'Kusama staking',
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

  const tree = renderer
    .create(
      <Wallets navigation={null} />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

