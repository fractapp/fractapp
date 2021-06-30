import React, {useContext, useState} from 'react';
import { SubstrateAdaptor } from 'adaptors/substrate';
import {Network} from 'types/account';
import BN from 'bn.js';
import DB from 'storage/DB';
import {Keyring} from '@polkadot/keyring';
import {stringToU8a, u8aToHex} from '@polkadot/util';
import math from 'utils/math';
import { ApiPromise } from '@polkadot/api';
import BackendApi from 'utils/backend';

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
jest.mock('utils/math', () => ({
    convertToPlanck: jest.fn(),
    convertFromPlanckToViewDecimals: jest.fn(),
}));
jest.mock('utils/backend', () => ({
    substrateBalance: jest.fn(),

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
    ErrorCode: {
        ServiceUnavailable: 1,
    },
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
    ApiPromise.create.mockReturnValueOnce();
    const substrate = new SubstrateAdaptor('url',  Network.Polkadot);
    await substrate.init();
    expect(ApiPromise.create).toBeCalled();
});

it('SubstrateAdaptor balance', async () => {
    const subAdaptor = new SubstrateAdaptor('url', Network.Kusama);
    BackendApi.substrateBalance.mockReturnValueOnce(1);
    await subAdaptor.balance();
    expect(BackendApi.substrateBalance).toBeCalled();
});

it('SubstrateAdaptor calculateFee', async () => {
    const subAdaptor = new SubstrateAdaptor('url', Network.Kusama);
    const value = new BN(1);

    subAdaptor.substrateApi = {
        tx: {
            balances: {
                transfer: jest.fn(() => {
                    return ({
                        paymentInfo: jest.fn(() => ({
                            partialFee: {
                                toBn: jest.fn(),
                            },
                        })),
                    });
                }),
            },
        },
    };
    await subAdaptor.calculateFee(value, 'receiver');
    expect(ApiPromise.create).toBeCalled();
});

it('SubstrateAdaptor send Polkadot', async () => {
    const subAdaptor = new SubstrateAdaptor('url', Network.Polkadot);
    DB.getSeed.mockReturnValueOnce('seed');
    const sign = stringToU8a('sign');
    const signMock = jest.fn().mockReturnValueOnce(sign);
    Keyring.mockImplementationOnce(() => ({
      addFromUri: jest.fn(() => ({
        sign: signMock,
      })),
    }));
    subAdaptor.substrateApi = {
        tx: {
            balances: {
                transfer: jest.fn(() => ({
                    signAndSend: jest.fn(() => ({
                        toHex: jest.fn(),
                    })),
                })),
            },
        },
    };
    await subAdaptor.send();
    expect(DB.getSeed).toBeCalled();
});

it('SubstrateAdaptor send Kusama', async () => {
    const subAdaptor = new SubstrateAdaptor('url', Network.Kusama);
    DB.getSeed.mockReturnValueOnce('seed');
    const sign = stringToU8a('sign');
    const signMock = jest.fn().mockReturnValueOnce(sign);
    Keyring.mockImplementationOnce(() => ({
      addFromUri: jest.fn(() => ({
        sign: signMock,
      })),
    }));
    subAdaptor.substrateApi = {
        tx: {
            balances: {
                transfer: jest.fn(() => ({
                    signAndSend: jest.fn(() => ({
                        toHex: jest.fn(),
                    })),
                })),
            },
        },
    };
    await subAdaptor.send();
    expect(DB.getSeed).toBeCalled();
});

it('SubstrateAdaptor isValidTransfer error', async () => {
    math.convertToPlanck.mockReturnValueOnce(new BN('1000'));
    const subAdaptor = new SubstrateAdaptor('url', Network.Polkadot);
    BackendApi.substrateBalance.mockReturnValueOnce(1000);
    const res = await subAdaptor.isValidTransfer('sender', 'receiver', new BN(10), new BN(1));
    expect(BackendApi.substrateBalance).toBeCalled();
    expect(res).toStrictEqual({
        'errorCode': 1,
        'errorMsg': 'Try again',
        'errorTitle': 'Service unavailable',
        'isOk': false,
    });
});
//fix fetch 115-136
it('SubstrateAdaptor isValidTransfer', async () => {
    math.convertToPlanck.mockReturnValueOnce(new BN('1000'));
    const subAdaptor = new SubstrateAdaptor('url', Network.Polkadot);
    BackendApi.substrateBalance.mockReturnValueOnce(1000);
    const res = await subAdaptor.isValidTransfer('sender', 'receiver', new BN(10), new BN(1));
    expect(BackendApi.substrateBalance).toBeCalled();
    expect(res).toStrictEqual({
        'errorCode': 1,
        'errorMsg': 'Try again',
        'errorTitle': 'Service unavailable',
        'isOk': false,
    });
});
