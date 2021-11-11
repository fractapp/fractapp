import React from 'react';
import {TransactionDetails} from 'screens/TransactionDetails';
import renderer from 'react-test-renderer';
import { TxAction, TxStatus, TxType } from 'types/transaction';
import {Currency, Wallet} from 'types/wallet';
import {fireEvent, render} from '@testing-library/react-native';
import {showMessage} from 'react-native-flash-message';
import Clipboard from '@react-native-community/clipboard';
import StringUtils from 'utils/string';
import { useDispatch, useSelector } from 'react-redux';
import Store from 'storage/Store';
import { AccountType, Network } from 'types/account';

jest.mock('storage/DB', () => ({}));
jest.mock('utils/fractappClient', () => ({
  getImgUrl: jest.fn(() => 'http://127.0.0.1/1.png'),
}));
jest.mock('adaptors/adaptor', () => {});
jest.mock('react-native-crypto', () => {});
jest.mock('react-native-flash-message', () => ({
  showMessage: jest.fn(),
}));
jest.mock('@react-native-community/clipboard', () => ({
  setString: jest.fn(),
}));
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

const dispatch = jest.fn();
useDispatch.mockReturnValue(dispatch);

it('Test tx details (sent)', () => {
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
  store.users.users.userId = {
    isAddressOnly: true,
    title: 'title',
    value: {
      address: 'address',
      currency: Currency.DOT,
    },
  };

  store.serverInfo.prices[Currency.DOT] = 123;
  store.serverInfo.prices[Currency.KSM] = 321;
  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const tree = renderer
    .create(
      <TransactionDetails
        route={{
          params: {
            transaction:
              {
                id: '2',
                userId: 'userId',
                hash: 'hash1',

                address: 'address#1',
                currency: Currency.DOT,
                action: TxAction.Transfer,
                txType: TxType.Out,
                timestamp: new Date('12-12-2020').getTime(),

                value: 10,
                planckValue: '10000000',
                usdValue: 20,
                fullValue: '2000000',

                fee: 3000,
                planckFee: '300000',
                usdFee: 4000,

                status: TxStatus.Success,
              },
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test tx details (none)', () => {
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
  store.users.users.userId = {
    isAddressOnly: true,
    title: 'title',
    value: {
      address: 'address',
      currency: Currency.DOT,
    },
  };

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const tree = renderer
    .create(
      <TransactionDetails
        route={{
          params: {
            transaction:
              {
                id: '2',
                userId: 'userId',
                hash: 'hash1',

                address: 'address#1',
                currency: Currency.DOT,
                action: TxAction.Transfer,
                txType: TxType.None,
                timestamp: new Date('12-12-2020').getTime(),

                value: 10,
                planckValue: '10000000',
                usdValue: 20,
                fullValue: '2000000',

                fee: 3000,
                planckFee: '300000',
                usdFee: 4000,

                status: TxStatus.Success,
              },
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test tx details (received)', () => {
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
  store.users.users.userId = {
    isAddressOnly: true,
    title: 'title',
    value: {
      address: 'address',
      currency: Currency.DOT,
    },
  };

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const tree = renderer
    .create(
      <TransactionDetails
        route={{
          params: {
            transaction:
              {
                id: '2',
                userId: 'userId',
                hash: 'hash1',

                address: 'address#1',
                currency: Currency.DOT,
                action: TxAction.Transfer,
                txType: TxType.In,
                timestamp: new Date('12-12-2020').getTime(),

                value: 10,
                planckValue: '10000000',
                usdValue: 20,
                fullValue: '2000000',

                fee: 3000,
                planckFee: '300000',
                usdFee: 4000,

                status: TxStatus.Success,
              },
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test tx details (pending)', () => {
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
  store.users.users.userId = {
    isAddressOnly: true,
    title: 'title',
    value: {
      address: 'address',
      currency: Currency.DOT,
    },
  };

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const tree = renderer
    .create(
      <TransactionDetails
        route={{
          params: {
            transaction:
              {
                id: '2',
                userId: 'userId',
                hash: 'hash1',

                address: 'address#1',
                currency: Currency.DOT,
                action: TxAction.Transfer,
                txType: TxType.In,
                timestamp: new Date('12-12-2020').getTime(),

                value: 10,
                planckValue: '10000000',
                usdValue: 20,
                fullValue: '2000000',

                fee: 3000,
                planckFee: '300000',
                usdFee: 4000,

                status: TxStatus.Pending,
              },
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test tx details (fail)', () => {
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
  store.users.users.userId = {
    isAddressOnly: true,
    title: 'title',
    value: {
      address: 'address',
      currency: Currency.DOT,
    },
  };

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const tree = renderer
    .create(
      <TransactionDetails
        route={{
          params: {
            transaction:
              {
                id: '2',
                userId: 'userId',
                hash: 'hash1',

                address: 'address#1',
                currency: Currency.DOT,
                action: TxAction.Transfer,
                txType: TxType.In,
                timestamp: new Date('12-12-2020').getTime(),

                value: 10,
                planckValue: '10000000',
                usdValue: 20,
                fullValue: '2000000',

                fee: 3000,
                planckFee: '300000',
                usdFee: 4000,

                status: TxStatus.Fail,
              },
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click start with user', () => {
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
  store.users.users.userId = {
    isAddressOnly: true,
    title: 'address',
    value: {
      address: 'address',
      currency: Currency.DOT,
    },
  };

  store.serverInfo.prices[Currency.DOT] = 123;
  store.serverInfo.prices[Currency.KSM] = 321;
  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const component = render(
      <TransactionDetails
        route={{
          params: {
            transaction:
              {
                id: '2',
                userId: 'userId',
                hash: 'hash1',

                address: 'address',
                currency: Currency.DOT,
                action: TxAction.Transfer,
                txType: TxType.Out,
                timestamp: new Date('12-12-2020').getTime(),

                value: 10,
                planckValue: '10000000',
                usdValue: 20,
                fullValue: '2000000',

                fee: 3000,
                planckFee: '300000',
                usdFee: 4000,

                status: TxStatus.Success,
              },
          },
        }}
      />,
    );

  fireEvent.press(component.getByText('address'));
  expect(showMessage).toBeCalledWith({
    message: StringUtils.texts.showMsg.copiedToClipboard,
    type: 'info',
    icon: 'info',
  });
  expect(Clipboard.setString).toBeCalledWith('address');
});
