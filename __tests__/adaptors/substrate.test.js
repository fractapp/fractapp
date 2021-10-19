import React, {useContext, useState} from 'react';
import { SubstrateAdaptor } from 'adaptors/substrate';
import BN from 'bn.js';
import {ApiPromise, WsProvider} from '@polkadot/api';
import DB from 'storage/DB';
import {Keyring} from '@polkadot/keyring';
import {ErrorCode, IAdaptor, TransferValidation} from './adaptor';
import {Network} from 'types/account';
import math from 'utils/math';
import {Currency, getSymbol} from 'types/wallet';
import backend from 'utils/backend';
import StringUtils from 'utils/string';
import GlobalStore from 'storage/Global';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useContext: jest.fn(),
    useState: jest.fn(),
    Linking: jest.fn(() => ({
      openURL: jest.fn(),
    })),
}));
jest.mock('storage/DB', () => {});
jest.mock('react-native-i18n', () => ({
    t: (value) => value,
}));
jest.mock('adaptors/adaptor', () => ({
  Adaptors: {
    init: jest.fn(),
    get: jest.fn(),
    isValidTransfer: jest.fn(),
  },
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
    Adaptors: {
        init: jest.fn(),
        get: jest.fn(),
        isValidTransfer: jest.fn(),
    },
}));

it('SubstrateAdaptor model Polkadot', async () => {
    const subAdaptor = new SubstrateAdaptor('url', Network.Polkadot);

    expect(subAdaptor).toBeInstanceOf(SubstrateAdaptor);
});
