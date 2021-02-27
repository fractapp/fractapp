import React from 'react';
import renderer from 'react-test-renderer';
import {ChatShortInfo} from 'components/ChatShortInfo';
import {Currency} from '../../src/types/wallet';
import {TxStatus, TxType} from '../../src/types/transaction';

jest.mock('utils/backend', () => ({
  getImgUrl: jest.fn(),
}));
it('Test one', () => {
  const tree = renderer
    .create(
      <ChatShortInfo
        name={'name'}
        notificationCount={10}
        tx={{
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
        user={null}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test two', () => {
  const tree = renderer
    .create(
      <ChatShortInfo
        name={'name'}
        notificationCount={0}
        tx={{
          id: '4',
          userId: 'userId',
          address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
          currency: Currency.Polkadot,
          txType: TxType.Sent,
          timestamp: new Date('02-12-2020').getTime(),
          value: 10,
          usdValue: 0,
          fee: 10,
          usdFee: 10,
          status: TxStatus.Pending,
        }}
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

it('Test three', () => {
  const tree = renderer
    .create(
      <ChatShortInfo
        name={'name'}
        notificationCount={10}
        tx={{
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
