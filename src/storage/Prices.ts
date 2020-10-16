import { Account } from "models/account";
import { Currency } from "models/wallet";
import React, { createContext, useReducer } from "react";

export enum Action {
  UPDATE_PRICE
}
export const initialState = { prices: new Map<Currency, number>() }
export const Context = React.createContext(initialState)
export function reducer(prevState: any, action: any) {
  let copy = Object.assign({}, prevState);

  switch (action.type) {
    case Action.UPDATE_PRICE:
      copy.prices.set(action.currency, action.price)
      return {
        ...prevState,
        prices: copy.prices,
      };
  }
}

export const updatePrice = (currency: Currency, price: number) => (
  {
    type: Action.UPDATE_PRICE,
    price: price,
    currency: currency
  }
)