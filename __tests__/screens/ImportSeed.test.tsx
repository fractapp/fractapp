import React, { useState } from 'react';

import { mnemonicValidate } from '@polkadot/util-crypto';
import { ImportSeed } from 'screens/ImportSeed';
import renderer from 'react-test-renderer';
import * as AuthStore from 'storage/Auth'

jest.mock('react-native-crypto', () => { })
jest.mock('utils/db', () => ({
    createAccounts: async (seed: string) => { }
}))

jest.mock('@polkadot/util-crypto', () => ({
    mnemonicValidate: jest.fn(),
}));
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
}))

useState.mockImplementation(init => [init, jest.fn()])

it('Test empty seed', () => {

    const tree = renderer
        .create(
            <AuthStore.Context.Provider value={{
                isSign: false
            }}>
                <ImportSeed />
            </AuthStore.Context.Provider>
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});

it('Test invalid seed', () => {
    useState
        .mockImplementationOnce(init => ["run knee code wall merge impact teach grain slim quality patient curve123123", jest.fn()])

    mnemonicValidate.mockImplementation((seed) => false)

    const tree = renderer
        .create(
            <AuthStore.Context.Provider value={{
                isSign: false
            }}>
                <ImportSeed />
            </AuthStore.Context.Provider>
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});

it('Test valid seed', () => {
    useState
        .mockImplementationOnce(init => ["run knee code wall merge impact teach grain slim quality patient curve", jest.fn()])

    mnemonicValidate.mockImplementation((seed) => true)

    const tree = renderer
        .create(
            <AuthStore.Context.Provider value={{
                isSign: false
            }}>
                <ImportSeed />
            </AuthStore.Context.Provider>
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});


it('Test loading', () => {
    useState
        .mockImplementationOnce(init => ["run knee code wall merge impact teach grain slim quality patient curve", jest.fn()])
        .mockImplementationOnce(init => [true, jest.fn()])

    mnemonicValidate.mockImplementation((seed) => true)

    const tree = renderer
        .create(
            <AuthStore.Context.Provider value={{
                isSign: false
            }}>
                <ImportSeed />
            </AuthStore.Context.Provider>
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});