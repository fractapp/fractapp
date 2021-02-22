import React from 'react';
import renderer from 'react-test-renderer';
import {TransactionInfo} from 'components/TransactionInfo';
import {Currency} from 'models/wallet';
import {Transaction, TxStatus, TxType} from 'models/transaction';

jest.mock('utils/backend', () => ({
  getImgUrl: jest.fn(),
}));

it('Test one', () => {
  const tree = renderer
    .create(
      <TransactionInfo
        transaction={{
          id: '1',
          userId: 'userId',
          address: 'address#1',
          currency: Currency.Polkadot,
          txType: TxType.None,
          timestamp: new Date('12-12-2020').getTime(),
          value: 10,
          usdValue: 10,
          fee: 10,
          usdFee: 10,
          status: TxStatus.Success,
        }}
        onPress={() => console.log('test')}
        user={null}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test two', () => {
  const tree = renderer
    .create(
      <TransactionInfo
        transaction={{
          id: '2',
          userId: 'userId',
          address: 'address#2',
          currency: Currency.Kusama,
          txType: TxType.Sent,
          timestamp: new Date('02-12-2020').getTime(),
          value: 10,
          usdValue: 10,
          fee: 10,
          usdFee: 10,
          status: TxStatus.Fail,
        }}
        onPress={() => console.log('test')}
        user={null}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test three', () => {
  const tree = renderer
    .create(
      <TransactionInfo
        transaction={{
          id: '3',
          userId: 'userId',
          address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
          currency: Currency.Kusama,
          txType: TxType.Received,
          timestamp: new Date('02-12-2020').getTime(),
          value: 10,
          usdValue: 10,
          fee: 10,
          usdFee: 10,
          status: TxStatus.Pending,
        }}
        onPress={() => console.log('test')}
        user={null}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test four', () => {
  const tree = renderer
    .create(
      <TransactionInfo
        transaction={{
          id: '4',
          userId: 'userId',
          address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
          currency: Currency.Kusama,
          txType: TxType.Received,
          timestamp: new Date('02-12-2020').getTime(),
          value: 10,
          usdValue: 10,
          fee: 10,
          usdFee: 10,
          status: TxStatus.Pending,
        }}
        onPress={() => console.log('test')}
        user={{
          id: 'id',
          name: 'name',
          username: 'username',
          avatarExt: 'png',
          lastUpdate: new Date('12-12-2020').getTime(),
          addresses: {
            0: 'addressOne',
            1: 'addressTwo',
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test five', () => {
  const tree = renderer
    .create(
      <TransactionInfo
        transaction={{
          id: '4',
          userId: 'userId',
          address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
          currency: Currency.Kusama,
          txType: TxType.Received,
          timestamp: new Date('02-12-2020').getTime(),
          value: 10,
          usdValue: 0,
          fee: 10,
          usdFee: 10,
          status: TxStatus.Pending,
        }}
        onPress={() => console.log('test')}
        user={{
          id: 'id',
          name: 'name',
          username: 'username',
          avatarExt: '',
          lastUpdate: new Date('12-12-2020').getTime(),
          addresses: {
            0: 'addressOne',
            1: 'addressTwo',
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
