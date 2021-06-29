import React, {useContext, useState} from 'react';
import { SubstrateAdaptor } from 'adaptors/substrate';
import {Network} from 'types/account';
import { BaseNavigationContainer } from '@react-navigation/native';
import BN from 'bn.js';
import DB from 'storage/DB';
import {Keyring} from '@polkadot/keyring';
import {stringToU8a, u8aToHex} from '@polkadot/util';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useContext: jest.fn(),
    useState: jest.fn(),
    Linking: jest.fn(() => ({
      openURL: jest.fn(),
    })),
}));
jest.mock('storage/DB', () => ({
    getSeed: jest.fn(),
}));
jest.mock('utils/backend', () => ({
    substrateBalance: () => 1,
}));
jest.mock('react-native-i18n', () => ({
    t: (value) => value,
}));
jest.mock('@polkadot/api', () => ({
    ApiPromise: {
        api:jest.fn(),
        create: jest.fn(),
    },
    WsProvider: jest.fn(),
}));
jest.mock('react-native-randombytes', (size) => {
    return {
      generateSecureRandom: jest.fn(() => {
        let uint8 = new Uint8Array(size);
        uint8 = uint8.map(() => Math.floor(Math.random() * 90) + 10);
        return uint8;
      }),
    };
});
jest.mock('readable-stream', () => ({
    Transform: jest.fn(),
}));
jest.mock('adaptors/adaptor', () => ({
    IAdaptor: jest.fn(),
}));
jest.mock('@polkadot/keyring', () => ({
    Keyring: jest.fn(),
  }));

it('SubstrateAdaptor model Polkadot', async () => {
    const subAdaptor = new SubstrateAdaptor('url', Network.Polkadot);
    expect(subAdaptor).toBeInstanceOf(SubstrateAdaptor);
});

it('SubstrateAdaptor model Kusama', async () => {
    const subAdaptor = new SubstrateAdaptor('url', Network.Kusama);
    expect(subAdaptor).toBeInstanceOf(SubstrateAdaptor);
});

it('SubstrateAdaptor init', async () => {
    const subAdaptor = new SubstrateAdaptor('url', Network.Kusama);
    expect(await subAdaptor.init()).toHaveBeenCalledTimes(1);
});

it('SubstrateAdaptor balance', async () => {
    const subAdaptor = new SubstrateAdaptor('url', Network.Kusama);
    expect(await subAdaptor.balance()).toStrictEqual(1);
});

it('SubstrateAdaptor calculateFee', async () => {
    const subAdaptor = new SubstrateAdaptor('url', Network.Kusama);
    const value = new BN(1);
    expect(await subAdaptor.calculateFee(value, 'receiver')).toStrictEqual(1);
});

it('SubstrateAdaptor send Polkadot', async () => {
    const subAdaptor = new SubstrateAdaptor('url', Network.Polkadot);
    const sign = stringToU8a('sign');
    const signMock = jest.fn().mockReturnValueOnce(sign);
    Keyring.mockImplementation(() => ({
      addFromUri: jest.fn(() => ({
        sign: signMock,
      })),
    }));
    expect(await subAdaptor.send()).toStrictEqual(1);
});

it('SubstrateAdaptor send Kusama', async () => {
    const subAdaptor = new SubstrateAdaptor('url', Network.Kusama);
    const sign = stringToU8a('sign');
    const signMock = jest.fn().mockReturnValueOnce(sign);
    Keyring.mockImplementation(() => ({
      addFromUri: jest.fn(() => ({
        sign: signMock,
      })),
    }));
    expect(await subAdaptor.send()).toStrictEqual(1);
});
