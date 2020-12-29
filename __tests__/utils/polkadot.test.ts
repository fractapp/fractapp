import {ApiPromise, WsProvider} from '@polkadot/api';
import {Currency} from 'models/wallet';
import {Api} from 'utils/polkadot';
import BN from 'bn.js';
import {Transaction, TxType} from 'models/transaction';

global.fetch = jest.fn();
jest.mock('@polkadot/api', () => ({
  ApiPromise: {
    create: jest.fn(),
  },
  Api: jest.fn().mockImplementation(() => {
    return {};
  }),
  WsProvider: jest.fn(),
}));

it('Test get instance polkadot', async () => {
  Api.getInstance(Currency.Polkadot);
  expect(WsProvider).toBeCalledWith('wss://rpc.polkadot.io');

  const api = Api.getInstance(Currency.Polkadot);
  expect(api).toStrictEqual(
    new Api(
      await ApiPromise.create(),
      Currency.Polkadot,
      'https://explorer-31.polkascan.io/polkadot',
      new BN(10),
    ),
  );
});

it('Test get instance kusams', async () => {
  Api.getInstance(Currency.Kusama);
  expect(WsProvider).toBeCalledWith('wss://kusama-rpc.polkadot.io');

  const api = Api.getInstance(Currency.Kusama);
  expect(api).toStrictEqual(
    new Api(
      await ApiPromise.create(),
      Currency.Kusama,
      'https://explorer-31.polkascan.io/kusama',
      new BN(12),
    ),
  );
});

it('Test get instance convertFromPlanck', async () => {
  const api = Api.getInstance(Currency.Kusama);
  expect(api.convertFromPlanck(new BN('10000000000000'))).toBe(10);
  expect(api.convertFromPlanck(new BN('100000000000'))).toBe(0.1);
  expect(api.convertFromPlanck(new BN('25000000000000'))).toBe(25);
});

it('Test get instance getTransactions', async () => {
  const api = Api.getInstance(Currency.Polkadot);

  const address = 'address';
  const member = 'member';
  const transferAmount = '15000000000000000';
  let transactions = new Array();
  for (let i = 0; i < 5; i++) {
    transactions.push({
      attributes: {
        block_id: 'blockId' + i,
        extrinsic_idx: 'id' + i,
        attributes: [
          {value: i % 2 ? address : member},
          {value: i % 2 ? member : address},
          {value: transferAmount},
        ],
      },
    });
  }
  fetch.mockReturnValueOnce({
    ok: true,
    json: () => ({
      data: transactions,
    }),
  });

  const treasuryFee = '100000000000000';
  const anyFee = '200000000000000';
  for (let i = 0; i < 5; i++) {
    fetch.mockReturnValueOnce({
      ok: true,
      json: () => ({
        data: {
          attributes: {
            datetime: '12-12-2020',
          },
        },
        included: [
          {
            attributes: {
              module_id: 'treasury',
              event_id: 'Deposit',
              attributes: [{value: treasuryFee}],
            },
          },
          {
            attributes: {
              module_id: 'balances',
              event_id: 'Deposit',
              attributes: [{}, {value: anyFee}],
            },
          },
        ],
      }),
    });
  }

  const txs = await api.getTransactions(address, 1, 10);

  for (let i = 0; i < 5; i++) {
    expect(txs[i]).toStrictEqual(
      new Transaction(
        `blockId${i}-id${i}`,
        member,
        Currency.Polkadot,
        i % 2 ? TxType.Sent : TxType.Received,
        new Date('12-12-2020'),
        api.convertFromPlanck(new BN(transferAmount)),
        api.convertFromPlanck(new BN(treasuryFee).add(new BN(anyFee))),
      ),
    );
  }
});
