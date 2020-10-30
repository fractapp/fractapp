import React, { useState } from 'react';

import { WalletFileImport } from 'screens/WalletFileImport';
import renderer from 'react-test-renderer';
import AuthStore from 'storage/Auth'

jest.mock('utils/db', () => ({
    createAccounts: async (seed: string) => { }
}))
jest.mock('utils/backup', () => ({
    getSeed: jest.fn()
}))

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
}))

useState.mockImplementation(init => [init, jest.fn()])

it('Test positive', () => {
    const tree = renderer
        .create(
            <AuthStore.Context.Provider value={{
                isSign: false
            }}>
                <WalletFileImport route={{ params: { file: {} } }} />
            </AuthStore.Context.Provider>
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});

it('Test loading', () => {
    useState
        .mockImplementationOnce(init => [init, jest.fn()])
        .mockImplementationOnce(init => [true, jest.fn()])
    const tree = renderer
        .create(
            <AuthStore.Context.Provider value={{
                isSign: false
            }}>
                <WalletFileImport route={{ params: { file: {} } }} />
            </AuthStore.Context.Provider>
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});