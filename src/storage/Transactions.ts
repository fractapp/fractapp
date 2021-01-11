import {Currency} from 'models/wallet';
import {createContext, Dispatch} from 'react';
import {Transaction} from 'models/transaction';
import DB from 'storage/DB';

/**
 * @namespace
 * @category Context storage
 */
namespace TransactionsStore {
  export enum Action {
    ADD_TX,
    SET_TXS,
  }

  export const initialState = new Map<Currency, Map<string, Transaction>>();

  export type ContextType = {
    state: Map<Currency, Map<string, Transaction>>;
    dispatch: Dispatch<any>;
  };

  export const Context = createContext<ContextType>({
    state: initialState,
    dispatch: () => null,
  });

  export function reducer(
    prevState: Map<Currency, Map<string, Transaction>>,
    action: any,
  ): Map<Currency, Map<string, Transaction>> {
    let copy = new Map(prevState);

    switch (action.type) {
      case Action.SET_TXS:
        copy.set(action.currency, action.txs);
        return copy;
      case Action.ADD_TX:
        if (!copy.has(action.currency)) {
          copy.set(action.currency, new Map<string, Transaction>());
        }

        copy.get(action.currency)?.set(action.tx.id, action.tx);

        DB.addTxs(action.currency, action.tx);
        return copy;
      default:
        return prevState;
    }
  }

  export const addTx = (currency: Currency, tx: Transaction) => ({
    type: Action.ADD_TX,
    tx: tx,
    currency: currency,
  });
  export const setTxs = (
    currency: Currency,
    txs: Map<string, Transaction>,
  ) => ({
    type: Action.SET_TXS,
    txs: txs,
    currency: currency,
  });
}
export default TransactionsStore;
