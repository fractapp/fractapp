import React, {useContext, useState} from 'react';
import {Adaptors} from 'adaptors/adaptor';
import GlobalStore from 'storage/Global';
import { Network } from 'types/account';
import {SubstrateAdaptor} from 'adaptors/substrate';

jest.mock('react-native-randombytes', (size) => {
  return {
    generateSecureRandom: jest.fn(() => {
      let uint8 = new Uint8Array(size);
      uint8 = uint8.map(() => Math.floor(Math.random() * 90) + 10);
      return uint8;
    }),
  };
});
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));
jest.mock('readable-stream', () => ({
    Transform: jest.fn(),
}));
jest.mock('adaptors/substrate', () => ({
  SubstrateAdaptor: jest.fn(),
}));
jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useContext: jest.fn(),
    useState: jest.fn(),
    Linking: jest.fn(() => ({
      openURL: jest.fn(),
    })),
}));

it('Adaptors model Polkadot', async () => {
  const globalContext = GlobalStore.initialState();
  globalContext.state = {
    urls: new Map([
      [
        Network.Polkadot,
        '',
      ],
    ]),
  };
  const s = new SubstrateAdaptor('url', Network.Polkadot);
  const adaptorInit = Adaptors.init(globalContext);

  expect(adaptorInit).toHaveBeenCalledTimes(1);
});

it('Adaptors model Kusama', async () => {
  const globalContext = GlobalStore.initialState();
  globalContext.state = {
    urls: new Map([
      [
        Network.Kusama,
        '',
      ],
    ]),
  };
  const s = new SubstrateAdaptor('url', Network.Kusama);
  const adaptorInit = Adaptors.init(globalContext);

  expect(adaptorInit).toHaveBeenCalledTimes(1);
});

it('Adaptors get', async () => {
  expect(Adaptors.get(Network.Polkadot))
  .toEqual({});
});
