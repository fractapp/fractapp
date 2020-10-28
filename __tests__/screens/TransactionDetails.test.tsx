import React from 'react';
import { TransactionDetails } from 'screens/TransactionDetails';
import renderer from 'react-test-renderer';
import { Transaction, TxType } from 'models/transaction';
import { Currency, Wallet } from 'models/wallet';

it('Test tx details #1', () => {
    const tree = renderer
        .create(<TransactionDetails route={
            {
                params: {
                    transaction: new Transaction("Id#1", "Member#1", Currency.Polkadot, TxType.Sent, new Date("12-12-2020"), 111, 112),
                    wallet: new Wallet("Wallet#1", "Address#1", Currency.Polkadot, 100, 101)
                }
            }
        } />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});


it('Test tx details #2', () => {
    const tree = renderer
        .create(<TransactionDetails route={
            {
                params: {
                    transaction: new Transaction("Id#2", "Member#2", Currency.Polkadot, TxType.Received, new Date("12-12-2020"), 211, 212),
                    wallet: new Wallet("Wallet#2", "Address#2", Currency.Kusama, 200, 201)
                }
            }
        } />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
