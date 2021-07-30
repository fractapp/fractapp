import {Account} from 'types/account';
import {Currency} from 'types/wallet';
import db from 'storage/DB';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * @namespace
 * @category Storage
 */
namespace  AccountsStore {
  export type State = {
    accounts: {
      [id in Currency]: Account
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
        balance: number,
        planks: string,
      }>): State {
        const account = state.accounts[action.payload.currency];
        if (!account) {
          return state;
        }
        account.balance = action.payload.balance;
        account.planks = action.payload.planks;
        db.setAccountInfo(account);
        return state;
      },
    },
  });

  export const actions = slice.actions;
  export const reducer = slice.reducer;
}
export default AccountsStore;
