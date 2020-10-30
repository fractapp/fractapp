import { Currency } from "models/wallet";
import React, { Dispatch } from "react";

/**
 * @namespace
   * @category Context storage
*/
namespace PricesStore {
  export enum Action {
    UPDATE_PRICE
  }

  type State = {
    prices: Map<Currency, number>,
    dispatch: Dispatch<any>
  };

  export const initialState: State = {
    prices: new Map<Currency, number>()
  }

  export const Context = React.createContext(initialState)
  export function reducer(prevState: any, action: any) {
    let copy = Object.assign({}, prevState);

    switch (action.type) {
      case Action.UPDATE_PRICE:
        copy.prices.set(action.currency, action.price)
        return {
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
}
export default PricesStore