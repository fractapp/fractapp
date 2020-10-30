import React, { useState } from 'react';
import { ConfirmSaveSeed } from 'screens/ConfirmSaveSeed';
import renderer from 'react-test-renderer';
import AuthStore from 'storage/Auth'

jest.mock('utils/polkadot', () => { })
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
}))

useState.mockImplementation(init => [init, jest.fn()])

jest.mock('utils/db', () => ({
    createAccounts: async (seed: string) => { }
}))

const seed = "run knee code wall merge impact teach grain slim quality patient curve".split(" ")

it('Test confirm seed start', async () => {
    useState
        .mockImplementationOnce(init => [[], jest.fn()])
        .mockImplementationOnce(init => [seed, jest.fn()])

    const tree = renderer
        .create(
            <AuthStore.Context.Provider value={{
                isSign: false
            }}>
                <ConfirmSaveSeed
                    route={{
                        params: {
                            seed: seed
                        }
                    }} />
            </AuthStore.Context.Provider>
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});

it('Test confirm seed incorrectly', async () => {
    let selectedSeed = [...seed]
    selectedSeed.splice(3, 1)
    selectedSeed.push(seed[3])

    useState
        .mockImplementationOnce(init => [selectedSeed, jest.fn()])
        .mockImplementationOnce(init => [[], jest.fn()])

    const tree = renderer
        .create(
            <AuthStore.Context.Provider value={{
                isSign: false
            }}>
                <ConfirmSaveSeed
                    route={{
                        params: {
                            seed: seed
                        }
                    }} />
            </AuthStore.Context.Provider>
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});

it('Test confirm seed success', async () => {
    useState
        .mockImplementationOnce(init => [seed, jest.fn()])
        .mockImplementationOnce(init => [[], jest.fn()])

    const tree = renderer
        .create(
            <AuthStore.Context.Provider value={{
                isSign: false
            }}>
                <ConfirmSaveSeed
                    route={{
                        params: {
                            seed: seed
                        }
                    }} />
            </AuthStore.Context.Provider>
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});