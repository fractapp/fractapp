import {Currency} from 'models/wallet';
import React, {Dispatch} from 'react';
import {Transaction} from 'models/transaction';

/**
 * @namespace
 * @category Context storage
 */
namespace TransactionsStore {
  export enum Action {
    ADD_TX,
    SET_TXS,
  }

  type State = {
    transactions: Map<Currency, Map<string, Transaction>>;
    dispatch?: Dispatch<any>;
  };

  export const initialState: State = {
    transactions: new Map<Currency, Map<string, Transaction>>(),
  };

  export const Context = React.createContext(initialState);
  export function reducer(prevState: any, action: any) {
    let copy = Object.assign({}, prevState);
    let txsByCurrency = <Map<Currency, Map<string, Transaction>>>(
      copy.transactions
    );

    switch (action.type) {
      case Action.SET_TXS:
        txsByCurrency.set(action.currency, action.txs);
        return copy;
      case Action.ADD_TX:
        if (!txsByCurrency.has(action.currency)) {
          txsByCurrency.set(action.currency, new Map<string, Transaction>());
        }

        txsByCurrency.get(action.currency)?.set(action.tx.id, action.tx);
        return copy;
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
