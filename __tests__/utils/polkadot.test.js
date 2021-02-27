import {ApiPromise, WsProvider} from '@polkadot/api';
import {Currency} from '../../src/types/wallet';
import {Api} from 'utils/polkadot';
import BN from 'bn.js';
import {TxStatus, TxType} from '../../src/types/transaction';
import {
  KUSAMA_SUBSCAN_API,
  KUSAMA_WSS_API,
  POLKADOT_SUBSCAN_API,
  POLKADOT_WSS_API,
} from '@env';
import DB from 'storage/DB';

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
jest.mock('storage/DB', () => ({
  getSeed: jest.fn(),
}));
jest.mock('@polkadot/util-crypto', () => ({}));
jest.mock('react-native-crypto', () => ({}));

it('Test get instance polkadot', async () => {
  await Api.getInstance(Currency.Polkadot);

  const api = await Api.getInstance(Currency.Polkadot);
  expect(api).toStrictEqual(
    new Api(POLKADOT_WSS_API, Currency.Polkadot, POLKADOT_SUBSCAN_API, 10),
  );
});

it('Test get instance kusama', async () => {
  await Api.getInstance(Currency.Kusama);

  const api = await Api.getInstance(Currency.Kusama);
  expect(api).toStrictEqual(
    new Api(KUSAMA_WSS_API, Currency.Kusama, KUSAMA_SUBSCAN_API, 12),
  );
});

it('Test get instance throw', async () => {
  return Api.getInstance(123123).catch((e) =>
    expect(e).toMatch('Invalid currency'),
  );
});

it('Test getSubstrateApi', async () => {
  const api = await Api.getInstance(Currency.Polkadot);
  await api.getSubstrateApi();
  expect(WsProvider).toBeCalledWith(POLKADOT_WSS_API);
});

it('Test convertFromPlanckWithViewDecimals', async () => {
  const api = await Api.getInstance(Currency.Kusama);
  expect(api.convertFromPlanckWithViewDecimals(new BN('10000000000000'))).toBe(
    10,
  );
  expect(api.convertFromPlanckWithViewDecimals(new BN('100000000000'))).toBe(
    0.1,
  );
  expect(api.convertFromPlanckWithViewDecimals(new BN('25000000000000'))).toBe(
    25,
  );
});

it('Test convertFromPlanckString', async () => {
  const api = await Api.getInstance(Currency.Kusama);
  expect(api.convertFromPlanckString(new BN('10000000000001'))).toBe(
    '10.000000000001',
  );
  expect(api.convertFromPlanckString(new BN('1'))).toBe('0.000000000001');
  expect(api.convertFromPlanckString(new BN('100000000123'))).toBe(
    '0.100000000123',
  );
  expect(api.convertFromPlanckString(new BN('25000004000000'))).toBe(
    '25.000004000000',
  );
});

it('Test convertToPlanck', async () => {
  const api = await Api.getInstance(Currency.Kusama);
  expect(api.convertToPlanck(10).toString()).toBe(
    new BN('10000000000000').toString(),
  );
  expect(api.convertToPlanck(0.1).toString()).toBe(
    new BN('100000000000').toString(),
  );
  expect(api.convertToPlanck(25.127).toString()).toBe(
    new BN('25127000000000').toString(),
  );
});

it('Test minTransfer polkadot', async () => {
  const api = await Api.getInstance(Currency.Polkadot);
  expect((await api.minTransfer()).toString()).toBe(
    new BN('10000000000').toString(),
  );
});

it('Test minTransfer kusama', async () => {
  const api = await Api.getInstance(Currency.Kusama);
  expect((await api.minTransfer()).toString()).toBe(
    new BN('2000000000').toString(),
  );
});

it('Test balance', async () => {
  const api = await Api.getInstance(Currency.Polkadot);
  fetch.mockReturnValueOnce({
    ok: true,
    json: () => ({
      data: {
        account: {
          balance: '1.12',
        },
      },
    }),
  });

  const b = await api.balance();
  expect(b.value).toBe(1.12);
  expect(b.plankValue.toString()).toBe(new BN('11200000000').toString());
});

it('Test balance (invalid)', async () => {
  const api = await Api.getInstance(Currency.Polkadot);
  fetch.mockReturnValueOnce({
    ok: true,
    json: () => ({
      message: 'Success',
      data: undefined,
    }),
  });

  const b = await api.balance();
  expect(b.value).toBe(0);
  expect(b.plankValue.toString()).toBe(new BN('0').toString());
});

it('Test getTxStatus=true', async () => {
  const api = await Api.getInstance(Currency.Polkadot);
  fetch.mockReturnValueOnce({
    ok: true,
    json: () => ({
      data: {
        success: true,
      },
    }),
  });

  const s = await api.getTxStatus();
  expect(s).toBe(TxStatus.Success);
});

it('Test getTxStatus=false', async () => {
  const api = await Api.getInstance(Currency.Polkadot);
  fetch.mockReturnValueOnce({
    ok: true,
    json: () => ({
      data: {
        success: false,
      },
    }),
  });

  const s = await api.getTxStatus();
  expect(s).toBe(TxStatus.Fail);
});

it('Test getTxStatus (invalid)', async () => {
  const api = await Api.getInstance(Currency.Polkadot);
  fetch.mockReturnValueOnce({
    ok: true,
    json: () => ({
      data: {
        success: null,
      },
    }),
  });

  const s = await api.getTxStatus();
  expect(s).toBe(null);
});

it('Test getTransactionsWithoutUSDValue', async () => {
  const api = await Api.getInstance(Currency.Polkadot);
  const owner = 'owner';
  const member = 'member';
  const transfers = [
    {
      hash: 'idOne',
      from: owner,
      to: member,
      block_timestamp: new Date().getTime() / 1000,
      amount: 10000.12345,
      fee: '10000000',
      success: true,
    },
    {
      hash: 'idTwo',
      from: member,
      to: owner,
      block_timestamp: new Date().getTime() / 1000,
      amount: 5.12345,
      fee: '50000000',
      success: false,
    },
  ];

  fetch.mockReturnValueOnce({
    ok: true,
    json: () => ({
      data: {
        transfers: transfers,
      },
    }),
  });

  const s = await api.getTransactionsWithoutUSDValue(owner);
  expect(s[0]).toStrictEqual({
    id: transfers[0].hash,
    userId: null,
    address: transfers[0].to,
    currency: Currency.Polkadot,
    txType: TxType.Sent,
    timestamp: transfers[0].block_timestamp * 1000,
    value: 10000.123,
    usdValue: 0,
    fee: 0.001,
    usdFee: 0,
    status: TxStatus.Success,
  });
  expect(s[1]).toStrictEqual({
    id: transfers[1].hash,
    userId: null,
    address: transfers[1].from,
    currency: Currency.Polkadot,
    txType: TxType.Received,
    timestamp: transfers[1].block_timestamp * 1000,
    value: 5.123,
    usdValue: 0,
    fee: 0.005,
    usdFee: 0,
    status: TxStatus.Fail,
  });
});

it('Test updateUSDValueInTransaction', async () => {
  const api = await Api.getInstance(Currency.Polkadot);

  fetch.mockReturnValueOnce({
    ok: true,
    json: () => ({
      data: {
        price: {
          price: 125,
        },
      },
    }),
  });

  const tx = {
    id: 'hash',
    userId: null,
    address: 'address',
    currency: Currency.Polkadot,
    txType: TxType.Sent,
    timestamp: new Date().getTime(),
    value: 10000.123,
    usdValue: 0,
    fee: 0.001,
    usdFee: 0,
    status: TxStatus.Success,
  };

  await api.updateUSDValueInTransaction(tx);
  expect(tx.usdValue).toBe(1250015.37);
  expect(tx.usdFee).toBe(0.12);
});

//TODO: send test
