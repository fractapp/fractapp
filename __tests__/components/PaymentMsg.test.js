import React from 'react';
import renderer from 'react-test-renderer';
import {PaymentMsg} from 'components/PaymentMsg';
import {Currency} from 'types/wallet';
import {TxStatus, TxType} from 'types/transaction';

jest.mock('adaptors/adaptor', () => {});

it('Test success sent tx', () => {
  const tree = renderer
    .create(
      <PaymentMsg
        tx={{
          id: '4',
          userId: 'userId',
          address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
          currency: Currency.DOT,
          txType: TxType.Sent,
          timestamp: new Date('02-12-2020').getTime(),
          value: 10,
          usdValue: 10,
          fee: 10,
          usdFee: 10,
          status: TxStatus.Success,
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test success received tx', () => {
  const tree = renderer
    .create(
      <PaymentMsg
        tx={{
          id: '4',
          userId: 'userId',
          address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
          currency: Currency.DOT,
          txType: TxType.Received,
          timestamp: new Date('02-12-2020').getTime(),
          value: 10,
          usdValue: 10,
          fee: 10,
          usdFee: 10,
          status: TxStatus.Success,
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test pending sent tx', () => {
  const tree = renderer
    .create(
      <PaymentMsg
        tx={{
          id: '4',
          userId: 'userId',
          address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
          currency: Currency.KSM,
          txType: TxType.Sent,
          timestamp: new Date('02-12-2020').getTime(),
          value: 10,
          usdValue: 10,
          fee: 10,
          usdFee: 10,
          status: TxStatus.Pending,
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test fail sent tx', () => {
  const tree = renderer
    .create(
      <PaymentMsg
        tx={{
          id: '4',
          userId: 'userId',
          address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
          currency: Currency.KSM,
          txType: TxType.Sent,
          timestamp: new Date('02-12-2020').getTime(),
          value: 10,
          usdValue: 10,
          fee: 10,
          usdFee: 10,
          status: TxStatus.Fail,
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test received tx withzero usdValu', () => {
  const tree = renderer
    .create(
      <PaymentMsg
        tx={{
          id: '4',
          userId: 'userId',
          address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
          currency: Currency.KSM,
          txType: TxType.Received,
          timestamp: new Date('02-12-2020').getTime(),
          value: 10,
          usdValue: 0,
          fee: 10,
          usdFee: 10,
          status: TxStatus.Fail,
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
