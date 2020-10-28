import { Account } from 'models/account';
import { Currency } from 'models/wallet';
import { updateBalance, addAccount, Action, reducer, initialState } from 'storage/Accounts'


it('Test updateBalance', async () => {
    expect(updateBalance(Currency.Kusama, 1000)).toStrictEqual({
        type: Action.UPDATE_BALANCE,
        balance: 1000,
        currency: Currency.Kusama
    })
});

it('Test addAccount', async () => {
    const account = new Account("name", "address", "pubkey", Currency.Kusama, 1000)
    const result = addAccount(account)
    expect(result).toStrictEqual({
        type: Action.ADD_ACCOUNT,
        account: account
    })
});

it('Test reducer update balance', async () => {
    const account = new Account("name", "address", "pubkey", Currency.Kusama, 1000)
    const add = addAccount(account)
    const prevState = reducer(initialState, add)

    const updBalance = updateBalance(Currency.Kusama, 2000)
    account.balance = 2000
    expect(reducer(prevState, updBalance)).toStrictEqual({ accounts: new Map([[Currency.Kusama, add.account]]) })
});

it('Test reducer add account', async () => {
    const account = new Account("name", "address", "pubkey", Currency.Kusama, 1000)
    const add = addAccount(account)
    expect(reducer(initialState, add)).toStrictEqual({ accounts: new Map([[Currency.Kusama, add.account]]) })
});

