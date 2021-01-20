import {Account} from 'models/account';
import {Currency} from 'models/wallet';
import {createContext, Dispatch} from 'react';
import db from 'storage/DB';

/**
 * @namespace
 * @category Context storage
 */
namespace AccountsStore {
  export enum Action {
    ADD_ACCOUNT,
    UPDATE_BALANCE,
  }

  export const initialState: Map<Currency, Account> = new Map<
    Currency,
    Account
  >();

  export type ContextType = {
    state: Map<Currency, Account>;
    dispatch: Dispatch<any>;
  };

  export const Context = createContext<ContextType>({
    state: initialState,
    dispatch: () => null,
  });

  export function reducer(
    prevState: Map<Currency, Account>,
    action: any,
  ): Map<Currency, Account> {
    let copy = new Map(prevState);
    switch (action.type) {
      case Action.ADD_ACCOUNT:
        copy.set(action.account.currency, action.account);
        return copy;
      case Action.UPDATE_BALANCE:
        const account = copy.get(action.currency);
        if (account === undefined) {
          return prevState;
        }
        account.balance = action.balance;
        db.setAccountInfo(account);
        return copy;
      default:
        return prevState;
    }
  }

  export const updateBalance = (currency: Currency, balance: number) => ({
    type: Action.UPDATE_BALANCE,
    balance: balance,
    currency: currency,
  });
  export const addAccount = (account: Account) => ({
    type: Action.ADD_ACCOUNT,
    account: account,
  });
}
export default AccountsStore;
