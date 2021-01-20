import {Currency} from 'models/wallet';
import {createContext, Dispatch} from 'react';
import DB from 'storage/DB';

/**
 * @namespace
 * @category Context storage
 */
namespace PricesStore {
  export enum Action {
    SET,
    UPDATE_PRICE,
  }

  export const initialState: Map<Currency, number> = new Map<
    Currency,
    number
  >();

  export type ContextType = {
    state: Map<Currency, number>;
    dispatch: Dispatch<any>;
  };

  export const Context = createContext<ContextType>({
    state: initialState,
    dispatch: () => null,
  });

  export function reducer(
    prevState: Map<Currency, number>,
    action: any,
  ): Map<Currency, number> {
    let copy = new Map(prevState);

    switch (action.type) {
      case Action.SET:
        copy.set(action.currency, action.price);
        return copy;
      case Action.UPDATE_PRICE:
        copy.set(action.currency, action.price);
        DB.setPrice(action.currency, action.price);
        return copy;
      default:
        return prevState;
    }
  }
  export const set = (currency: Currency, price: number) => ({
    type: Action.SET,
    price: price,
    currency: currency,
  });

  export const updatePrice = (currency: Currency, price: number) => ({
    type: Action.UPDATE_PRICE,
    price: price,
    currency: currency,
  });
}
export default PricesStore;
