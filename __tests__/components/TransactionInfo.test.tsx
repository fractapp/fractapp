import React from 'react';
import renderer from 'react-test-renderer';
import { TransactionInfo } from 'components';
import { Currency } from 'models/wallet'
import { Transaction, TxType } from 'models/transaction';

it('Test currenyc=polkadot && txType=None && member length < 13', () => {
    const tree = renderer
        .create(<TransactionInfo transaction={new Transaction("1", "address#1", Currency.Polkadot, TxType.None, new Date("12-12-2020"), 10, 10)} />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});

it('Test currenyc=kusams && txType=None && member length < 13', () => {
    const tree = renderer
        .create(<TransactionInfo transaction={new Transaction("2", "address#2", Currency.Kusama, TxType.None, new Date("01-12-2020"), 5, 3)} />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});

it('Test member length > 13', () => {
    const tree = renderer
        .create(<TransactionInfo transaction={new Transaction("1", "1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE", Currency.Polkadot, TxType.None, new Date("12-12-2020"), 10, 10)} />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});

it('Test txType=Sent', () => {
    const tree = renderer
        .create(<TransactionInfo transaction={new Transaction("1", "1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE", Currency.Polkadot, TxType.Sent, new Date(), 10, 10)} />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});

it('Test txType=Received', () => {
    const tree = renderer
        .create(<TransactionInfo transaction={new Transaction("1", "1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE", Currency.Polkadot, TxType.Received, new Date(), 10, 10)} />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});


