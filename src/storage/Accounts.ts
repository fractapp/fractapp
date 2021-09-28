import { Account, Balance, AccountType } from 'types/account';
import { Currency, getFullCurrencyName } from 'types/wallet';
import DB from 'storage/DB';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * @namespace
 * @category Storage
 */
namespace  AccountsStore {
  export type State = {
    accounts: {
      [id in AccountType]: {
        [currency in Currency]: Account
      }
    };
    isInitialized: boolean;
  };

  export const initialState = (): State => <AccountsStore.State>({
    accounts: {},
    isInitialized: false,
  });

  const slice = createSlice({
    name: 'accounts',
    initialState: initialState(),
    reducers: {
      set(state: State, action: PayloadAction<State>): State {
        state = action.payload;
        return state;
      },
      updateBalance(state: State, action: PayloadAction<{
        currency: Currency,
        viewBalance: number,
        balance: Balance
      }>): State {
        const account = state.accounts[AccountType.Main][action.payload.currency];
        if (!account) {
          return state;
        }

        account.viewBalance = action.payload.viewBalance;
        account.balance = action.payload.balance;

        DB.setAccountStore(state);
        return state;
      },
      updateBalanceSubAccount(state: State, action: PayloadAction<{
        currency: Currency,
        accountType: AccountType,
        viewBalance: number,
        balance: string
      }>): State {
        const currency = action.payload.currency;
        const accountType = action.payload.accountType;
        const viewBalance = action.payload.viewBalance;
        const balance = action.payload.balance;

        if (state.accounts[accountType] === undefined) {
          state.accounts[accountType] = <{
            [currency in Currency]: Account
          }>{};
        }

        if (state.accounts[accountType][currency] === undefined) {
          const mainAccount = state.accounts[AccountType.Main][currency];

          state.accounts[accountType][currency] = {
            name: 'Staking ' + getFullCurrencyName(mainAccount.currency),
            address: mainAccount.address,
            pubKey: mainAccount.pubKey,
            currency: mainAccount.currency,
            network: mainAccount.network,
            viewBalance: mainAccount.viewBalance,
            type: accountType,
            balance: {
              total: balance,
              transferable: '0',
              payableForFee: '0',
            },
          };
        }

        const account = state.accounts[accountType][currency];
        account.viewBalance = viewBalance;
        account.balance.total = balance;
        DB.setAccountStore(state);
        return state;
      },
    },
  });

  export const actions = slice.actions;
  export const reducer = slice.reducer;
}
export default AccountsStore;
