import {Currency} from 'models/wallet';
import {createContext, Dispatch} from 'react';

/**
 * @namespace
 * @category Context storage
 */
namespace PricesStore {
  export enum Action {
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
      case Action.UPDATE_PRICE:
        copy.set(action.currency, action.price);
        return copy;
      default:
        return prevState;
    }
  }

  export const updatePrice = (currency: Currency, price: number) => ({
    type: Action.UPDATE_PRICE,
    price: price,
    currency: currency,
  });
}
export default PricesStore;
