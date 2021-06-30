import React, {useContext, useState} from 'react';
import { SubstrateAdaptor } from 'adaptors/substrate';
import {Network} from 'types/account';
import { BaseNavigationContainer } from '@react-navigation/native';
import BN from 'bn.js';
import DB from 'storage/DB';
import {Keyring} from '@polkadot/keyring';
import {stringToU8a, u8aToHex} from '@polkadot/util';
import { ErrorCode } from 'adaptors/adaptor';
import StringUtils from 'utils/string';
import {Currency, getSymbol} from 'types/wallet';
import math from 'utils/math';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useContext: jest.fn(),
    useState: jest.fn(),
    Linking: jest.fn(() => ({
      openURL: jest.fn(),
    })),
}));/*
jest.mock('bn.js', () => ({
        cmp: jest.fn(),
}));*/
jest.mock('storage/DB', () => ({
    getSeed: jest.fn(),
}));
jest.mock('utils/math', () => ({
    convertToPlanck: jest.fn(),
    convertFromPlanckToViewDecimals: jest.fn(),
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
    expect(subAdaptor.init()).toEqual({'_U': 0, '_V': 0, '_W': null, '_X': null});
});

it('SubstrateAdaptor balance', async () => {
    const subAdaptor = new SubstrateAdaptor('url', Network.Kusama);
    expect(await subAdaptor.balance()).toStrictEqual(1);
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

    expect(subAdaptor.calculateFee(value, 'receiver')).toEqual({'_U': 0, '_V': 0, '_W': null, '_X': null});
});

it('SubstrateAdaptor send Polkadot', async () => {
    const subAdaptor = new SubstrateAdaptor('url', Network.Polkadot);
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
    expect(subAdaptor.send()).toEqual({'_U': 0, '_V': 0, '_W': null, '_X': null});
});

it('SubstrateAdaptor send Kusama', async () => {
    const subAdaptor = new SubstrateAdaptor('url', Network.Kusama);
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
    expect(subAdaptor.send()).toEqual({'_U': 0, '_V': 0, '_W': null, '_X': null});
});

/*it('SubstrateAdaptor isValidTransfer', async () => {
    const subAdaptor = new SubstrateAdaptor('url', Network.Polkadot);
    subAdaptor.balance = jest.fn(() => -1);

    expect(await subAdaptor.isValidTransfer('sender', 'receiver', new BN(1), new BN(1))).toEqual({
        isOk: false,
        errorCode: 2,
        errorTitle: StringUtils.texts.MinimumTransferErrorTitle,
        errorMsg:
          StringUtils.texts.MinimumTransferErrorText +
          ` ${math.convertFromPlanckToViewDecimals(
            this.minTransfer,
            this.decimals,
            this.viewDecimals,
          )} ${getSymbol(Currency.DOT)}`,
    });
});*/
