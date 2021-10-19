import React, {useContext, useState} from 'react';
import {Adaptors} from 'adaptors/adaptor';
import GlobalStore from 'storage/Global';
import { Network } from 'types/account';
import {SubstrateAdaptor} from 'adaptors/substrate';
import {DEFAULT_KUSAMA_URL, DEFAULT_POLKADOT_URL} from '@env';

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

it('Adaptors test with default values', async () => {
  const globalContext = GlobalStore.initialState();
  globalContext.state = {
    urls: new Map(),
  };

  const polkadotUrlFn = jest.fn();
  const polkadotNetworkFn = jest.fn();
  const polkadotAdaptor = {
    name: 'polkadot',
  };

  const kusamaUrlFn = jest.fn();
  const kusamaNetworkFn = jest.fn();
  const kusamaAdaptor = {
    name: 'kusama',
  };

  SubstrateAdaptor.mockImplementationOnce((url, network) => {
    polkadotUrlFn(url);
    polkadotNetworkFn(network);
    return polkadotAdaptor;
  });
  SubstrateAdaptor.mockImplementationOnce((url, network) => {
    kusamaUrlFn(url);
    kusamaNetworkFn(network);
    return kusamaAdaptor;
  });
  Adaptors.init(globalContext);

  expect(polkadotUrlFn).toBeCalledWith(DEFAULT_POLKADOT_URL);
  expect(polkadotNetworkFn).toBeCalledWith(Network.Polkadot);

  expect(kusamaUrlFn).toBeCalledWith(DEFAULT_KUSAMA_URL);
  expect(kusamaNetworkFn).toBeCalledWith(Network.Kusama);

  expect(Adaptors.get(Network.Polkadot)).toEqual(polkadotAdaptor);
  expect(Adaptors.get(Network.Kusama)).toEqual(kusamaAdaptor);
});

it('Adaptors test with exist values', async () => {
  const globalContext = GlobalStore.initialState();
  const polkadotWs = 'polkadotWs';
  const kusamaWs = 'kusamaWs';

  globalContext.state = {
    urls: new Map([
      [Network.Polkadot, polkadotWs],
      [Network.Kusama, kusamaWs],
    ]),
  };

  const polkadotUrlFn = jest.fn();
  const polkadotNetworkFn = jest.fn();

  const kusamaUrlFn = jest.fn();
  const kusamaNetworkFn = jest.fn();

  SubstrateAdaptor.mockImplementationOnce((url, network) => {
    polkadotUrlFn(url);
    polkadotNetworkFn(network);
  });
  SubstrateAdaptor.mockImplementationOnce((url, network) => {
    kusamaUrlFn(url);
    kusamaNetworkFn(network);
  });
  Adaptors.init(globalContext);

  expect(polkadotUrlFn).toBeCalledWith(polkadotWs);
  expect(polkadotNetworkFn).toBeCalledWith(Network.Polkadot);

  expect(kusamaUrlFn).toBeCalledWith(kusamaWs);
  expect(kusamaNetworkFn).toBeCalledWith(Network.Kusama);
});
