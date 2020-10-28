import React, { useState } from 'react';
import { WalletDetails } from 'screens/WalletDetails';
import renderer from 'react-test-renderer';
import { Currency, Wallet } from 'models/wallet';
import { Transaction, TxType } from 'models/transaction';


jest.mock('utils/polkadot', () => { })
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
}))

useState.mockImplementation(init => [init, jest.fn()])


it('Test wallet details with empty trasnasctions', async () => {
    const tree = renderer
        .create(<WalletDetails
            navigation={null}
            route={{
                params: {
                    wallet: new Wallet("Wallet #1", "Address #1", Currency.Polkadot, 100, 100)
                }
            }} />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
it('Test wallet details with trasnasctions', async () => {
    let txs = new Map<string, Transaction>()
    for (let i = 0; i < 10; i++) {
        txs.set("id" + i, new Transaction("id" + i, "member" + i, Currency.Polkadot, TxType.Sent, new Date("12-12-2020"), 100, 123))
    }

    useState
        .mockImplementationOnce(init => [txs, jest.fn()])


    const tree = renderer
        .create(<WalletDetails
            navigation={null}
            route={{
                params: {
                    wallet: new Wallet("Wallet #2", "Address #2", Currency.Kusama, 111, 222)
                }
            }} />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});