import {Account} from 'types/account';
import {Currency} from 'types/wallet';
import {createContext, Dispatch} from 'react';
import db from 'storage/DB';

/**
 * @namespace
 * @category Context storage
 */
namespace AccountsStore {
  export enum Action {
    SET,
    UPDATE_BALANCE,
  }

  export type State = {
    accounts: Map<Currency, Account>;
    isInitialized: boolean;
  };

  export const initialState: State = {
    accounts: new Map<Currency, Account>(),
    isInitialized: false,
  };

  export type ContextType = {
    state: State;
    dispatch: Dispatch<any>;
  };

  export const Context = createContext<ContextType>({
    state: initialState,
    dispatch: () => null,
  });

  export function reducer(prevState: State, action: any): State {
    let copy: State = Object.assign({}, prevState);
    switch (action.type) {
      case Action.SET:
        copy.accounts = action.accounts;
        copy.isInitialized = true;
        return copy;
      case Action.UPDATE_BALANCE:
        const account = copy.accounts.get(action.currency);
        if (account === undefined) {
          return prevState;
        }
        account.balance = action.balance;
        account.planks = action.planks;
        db.setAccountInfo(account);
        return copy;
      default:
        return prevState;
    }
  }

  export const updateBalance = (
    currency: Currency,
    balance: number,
    planks: string,
  ) => ({
    type: Action.UPDATE_BALANCE,
    balance: balance,
    currency: currency,
    planks: planks,
  });
  export const set = (accounts: Map<Currency, Account>) => ({
    type: Action.SET,
    accounts: accounts,
  });
}
export default AccountsStore;
