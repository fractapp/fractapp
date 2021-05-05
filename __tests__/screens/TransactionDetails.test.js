import React from 'react';
import {TransactionDetails} from 'screens/TransactionDetails';
import renderer from 'react-test-renderer';
import {TxStatus, TxType} from 'types/transaction';
import {Currency, Wallet} from 'types/wallet';
import {fireEvent, render} from '@testing-library/react-native';
import {showMessage} from 'react-native-flash-message';
import Clipboard from '@react-native-community/clipboard';

jest.mock('storage/DB', () => ({}));
jest.mock('utils/backend', () => ({
  getImgUrl: jest.fn(() => 'http://127.0.0.1/1.png'),
}));
jest.mock('utils/polkadot', () => {});
jest.mock('react-native-crypto', () => {});
jest.mock('react-native-flash-message', () => ({
  showMessage: jest.fn(),
}));
jest.mock('@react-native-community/clipboard', () => ({
  setString: jest.fn(),
}));

it('Test tx details (sent)', () => {
  const tree = renderer
    .create(
      <TransactionDetails
        route={{
          params: {
            transaction: {
              id: '2',
              userId: 'userId',
              address: 'address#1',
              currency: Currency.DOT,
              txType: TxType.Sent,
              timestamp: new Date('12-12-2020').getTime(),
              value: 10,
              usdValue: 10,
              fee: 10,
              usdFee: 10,
              status: TxStatus.Success,
            },
            wallet: new Wallet(
              'Wallet#1',
              'Address#1',
              Currency.DOT,
              100,
              '100000',
              1000,
            ),
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test tx details (none)', () => {
  const tree = renderer
    .create(
      <TransactionDetails
        route={{
          params: {
            transaction: {
              id: '1',
              userId: 'userId',
              address: 'address#1',
              currency: Currency.KSM,
              txType: TxType.None,
              timestamp: new Date('12-12-2020').getTime(),
              value: 10,
              usdValue: 10,
              fee: 10,
              usdFee: 10,
              status: TxStatus.Success,
            },
            wallet: new Wallet(
              'Wallet#2',
              'Address#2',
              Currency.KSM,
              200,
              '10000',
              201,
            ),
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test tx details (received)', () => {
  const tree = renderer
    .create(
      <TransactionDetails
        route={{
          params: {
            transaction: {
              id: '2',
              userId: 'userId',
              address: 'address#1',
              currency: Currency.DOT,
              txType: TxType.Received,
              timestamp: new Date('12-12-2020').getTime(),
              value: 10,
              usdValue: 10,
              fee: 10,
              usdFee: 10,
              status: TxStatus.Success,
            },
            wallet: new Wallet(
              'Wallet#1',
              'Address#1',
              Currency.DOT,
              100,
              '100000',
              1000,
            ),
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test tx details (pending)', () => {
  const tree = renderer
    .create(
      <TransactionDetails
        route={{
          params: {
            transaction: {
              id: '2',
              userId: 'userId',
              address: 'address#1',
              currency: Currency.DOT,
              txType: TxType.Received,
              timestamp: new Date('12-12-2020').getTime(),
              value: 10,
              usdValue: 10,
              fee: 10,
              usdFee: 10,
              status: TxStatus.Pending,
            },
            wallet: new Wallet(
              'Wallet#1',
              'Address#1',
              Currency.DOT,
              100,
              '100000',
              1000,
            ),
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test tx details (fail)', () => {
  const tree = renderer
    .create(
      <TransactionDetails
        route={{
          params: {
            transaction: {
              id: '2',
              userId: 'userId',
              address: 'address#1',
              currency: Currency.DOT,
              txType: TxType.Received,
              timestamp: new Date('12-12-2020').getTime(),
              value: 10,
              usdValue: 10,
              fee: 10,
              usdFee: 10,
              status: TxStatus.Fail,
            },
            wallet: new Wallet(
              'Wallet#1',
              'Address#1',
              Currency.DOT,
              100,
              '100000',
              1000,
            ),
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test tx details without usd', () => {
  const tree = renderer
    .create(
      <TransactionDetails
        route={{
          params: {
            transaction: {
              id: '1',
              userId: 'userId',
              address: 'address#1',
              currency: Currency.KSM,
              txType: TxType.Sent,
              timestamp: new Date('12-12-2020').getTime(),
              value: 10,
              usdValue: 0,
              fee: 10,
              usdFee: 0,
              status: TxStatus.Success,
            },
            wallet: new Wallet(
              'Wallet#2',
              'Address#2',
              Currency.KSM,
              200,
              '10000',
              201,
            ),
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click start without user', () => {
  const component = render(
    <TransactionDetails
      route={{
        params: {
          transaction: {
            id: '2',
            userId: 'userId',
            address: 'address#1',
            currency: Currency.DOT,
            txType: TxType.Sent,
            timestamp: new Date('12-12-2020').getTime(),
            value: 10,
            usdValue: 10,
            fee: 10,
            usdFee: 10,
            status: TxStatus.Success,
          },
          wallet: new Wallet(
            'Wallet#1',
            'Address#1',
            Currency.DOT,
            100,
            '100000',
            1000,
          ),
        },
      }}
    />,
  );

  fireEvent.press(component.getByText('address#1'));
  expect(showMessage).toBeCalledWith({
    message: 'Copied',
    type: 'info',
    icon: 'info',
  });
  expect(Clipboard.setString).toBeCalledWith('address#1');
});

it('Test tx details with user', () => {
  const tree = renderer
    .create(
      <TransactionDetails
        route={{
          params: {
            transaction: {
              id: '2',
              userId: 'userId',
              address: 'address#1',
              currency: Currency.DOT,
              txType: TxType.Sent,
              timestamp: new Date('12-12-2020').getTime(),
              value: 10,
              usdValue: 10,
              fee: 10,
              usdFee: 10,
              status: TxStatus.Success,
            },
            wallet: new Wallet(
              'Wallet#1',
              'Address#1',
              Currency.DOT,
              100,
              '100000',
              1000,
            ),
            user: {
              id: 'id',
              name: 'name',
              username: 'username',
              avatarExt: '',
              lastUpdate: new Date('12-12-2020').getTime(),
              addresses: {
                0: 'addressOne',
                1: 'addressTwo',
              },
            },
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click start with user', () => {
  const component = render(
    <TransactionDetails
      route={{
        params: {
          transaction: {
            id: '2',
            userId: 'userId',
            address: 'address#1',
            currency: Currency.DOT,
            txType: TxType.Sent,
            timestamp: new Date('12-12-2020').getTime(),
            value: 10,
            usdValue: 10,
            fee: 10,
            usdFee: 10,
            status: TxStatus.Success,
          },
          wallet: new Wallet(
            'Wallet#1',
            'Address#1',
            Currency.DOT,
            100,
            '100000',
            1000,
          ),
          user: {
            id: 'id',
            name: 'name',
            username: 'username',
            avatarExt: '',
            lastUpdate: new Date('12-12-2020').getTime(),
            addresses: {
              0: 'addressOne',
              1: 'addressTwo',
            },
          },
        },
      }}
    />,
  );

  fireEvent.press(component.getByText('name'));
  expect(showMessage).toBeCalledWith({
    message: 'Copied',
    type: 'info',
    icon: 'info',
  });
  expect(Clipboard.setString).toBeCalledWith('@username');
});
