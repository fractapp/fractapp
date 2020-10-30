
import { Account } from "models/account";
import { Currency } from "models/wallet";
import React, { Dispatch } from "react";

/**
 * @namespace
   * @category Context storage
*/
namespace AccountsStore {
  export enum Action {
    ADD_ACCOUNT,
    UPDATE_BALANCE
  }

  type State = {
    accounts: Map<Currency, Account>,
    dispatch: Dispatch<any>
  };

  export const initialState: State = {
    accounts: new Map<Currency, Account>()
  }

  export const Context = React.createContext(initialState)
  export function reducer(prevState: any, action: any) {
    let copy = Object.assign({}, prevState);

    switch (action.type) {
      case Action.ADD_ACCOUNT:
        copy.accounts.set(action.account.currency, action.account)
        return {
          accounts: copy.accounts,
        };
      case Action.UPDATE_BALANCE:
        copy.accounts.get(action.currency).balance = action.balance
        return {
          accounts: copy.accounts,
        };
    }
  }

  export const updateBalance = (currency: Currency, balance: number) => (
    {
      type: Action.UPDATE_BALANCE,
      balance: balance,
      currency: currency
    }
  )
  export const addAccount = (account: Account) => (
    {
      type: Action.ADD_ACCOUNT,
      account: account
    }
  )
}
export default AccountsStore