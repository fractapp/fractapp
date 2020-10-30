import { Account } from 'models/account';
import { Currency } from 'models/wallet';
import Accounts from 'storage/Accounts'

it('Test updateBalance', async () => {
    expect(Accounts.updateBalance(Currency.Kusama, 1000)).toStrictEqual({
        type: Accounts.Action.UPDATE_BALANCE,
        balance: 1000,
        currency: Currency.Kusama
    })
});

it('Test addAccount', async () => {
    const account = new Account("name", "address", "pubkey", Currency.Kusama, 1000)
    const result = Accounts.addAccount(account)
    expect(result).toStrictEqual({
        type: Accounts.Action.ADD_ACCOUNT,
        account: account
    })
});

it('Test reducer update balance', async () => {
    const account = new Account("name", "address", "pubkey", Currency.Kusama, 1000)
    const add = Accounts.addAccount(account)
    const prevState = Accounts.reducer(Accounts.initialState, add)

    const updBalance = Accounts.updateBalance(Currency.Kusama, 2000)
    account.balance = 2000
    expect(Accounts.reducer(prevState, updBalance)).toStrictEqual({ accounts: new Map([[Currency.Kusama, add.account]]) })
});

it('Test reducer add account', async () => {
    const account = new Account("name", "address", "pubkey", Currency.Kusama, 1000)
    const add = Accounts.addAccount(account)
    expect(Accounts.reducer(Accounts.initialState, add)).toStrictEqual({ accounts: new Map([[Currency.Kusama, add.account]]) })
});

