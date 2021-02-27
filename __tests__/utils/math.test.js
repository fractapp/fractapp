import mathUtils from 'utils/math';
import {Currency} from '../../src/types/wallet';
import BN from 'bn.js';

jest.mock('utils/polkadot', () => {
  const BN = require('bn.js');
  return {
    Api: {
      getInstance: jest.fn(() => ({
        viewDecimals: 3,
        convertFromPlanckWithViewDecimals: jest.fn(() => 150),
        convertToPlanck: jest.fn(),
        getSubstrateApi: jest.fn(() => ({
          tx: {
            balances: {
              transferKeepAlive: jest.fn(() => ({
                paymentInfo: jest.fn(() => ({
                  partialFee: new BN(10000000000),
                })),
              })),
            },
          },
        })),
      })),
    },
  };
});
jest.mock('react-native-crypto');

it('Test floor', async () => {
  const v = mathUtils.floor(0.155555, 3);
  expect(v).toBe(0.155);
});

it('Test floorUsd', async () => {
  const v = mathUtils.floorUsd(0.155555);
  expect(v).toBe(0.15);
});

it('Test round', async () => {
  const v = mathUtils.round(0.155555, 3);
  expect(v).toBe(0.156);
});

it('Test calculateValue with isUsdMode = true', async () => {
  const v = await mathUtils.calculateValue(
    {
      state: new Map([[Currency.Polkadot, 125]]),
    },
    Currency.Polkadot,
    152.143,
    true,
  );
  expect(v).toBe(1.217);
});

it('Test calculateValue with isUsdMode = false', async () => {
  const v = await mathUtils.calculateValue(
    {
      state: new Map([[Currency.Polkadot, 125]]),
    },
    Currency.Polkadot,
    152.143,
    false,
  );
  expect(v).toBe(19017.88);
});

it('Test calculateTxInfo', async () => {
  const v = await mathUtils.calculateTxInfo(
    {
      state: new Map([[Currency.Polkadot, 125]]),
    },
    Currency.Polkadot,
    152.143,
    'receiver',
  );
  expect(v.fee.toString()).toBe(new BN(10000000000).toString());
  expect(v.usdFee).toBe(18750);
});

it('Test calculateValue without price', async () => {
  const v = await mathUtils.calculateValue(
    {
      state: new Map(),
    },
    Currency.Polkadot,
    152.143,
    false,
  );
  expect(v).toBe(0);
});

it('Test calculateTxInfo without price', async () => {
  const v = await mathUtils.calculateTxInfo(
    {
      state: new Map(),
    },
    Currency.Polkadot,
    152.143,
    'receiver',
  );
  expect(v.fee.toString()).toBe(new BN(10000000000).toString());
  expect(v.usdFee).toBe(0);
});
