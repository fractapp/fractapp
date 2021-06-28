import React, {useContext, useState} from 'react';
import { Adaptors, IAdaptor } from 'adaptors/adaptor';
import GlobalStore from 'storage/Global';
import { Network } from 'types/account';

jest.mock('react-native-randombytes', (size) => {
    return {
      generateSecureRandom: jest.fn(() => {
        let uint8 = new Uint8Array(size);
        uint8 = uint8.map(() => Math.floor(Math.random() * 90) + 10);
        return uint8;
      }),
    };
});
//этот мок глянуть
jest.mock('readable-stream', () => ({
    Transform: jest.fn(),
}));

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useContext: jest.fn(),
    useState: jest.fn(),
    Linking: jest.fn(() => ({
      openURL: jest.fn(),
    })),
}));
useState.mockImplementation((init) => [init, jest.fn()]);

it('Adaptors model #1', async () => {

});
