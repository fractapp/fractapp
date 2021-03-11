import {Currency} from 'types/wallet';
import {createContext, Dispatch} from 'react';
import {Transaction} from 'types/transaction';
import DB from 'storage/DB';

/**
 * @namespace
 * @category Context storage
 */
namespace TransactionsStore {
  export enum Action {
    SET,
    SET_TX,
    ADD_PENDING_TXS,
    REMOVE_PENDING_TXS,
  }

  export type State = {
    transactions: Map<Currency, Map<string, Transaction>>;
    pendingTransactions: Map<Currency, Array<string>>;
    isInitialized: boolean;
  };

  export const initialState = (): State => ({
    transactions: new Map<Currency, Map<string, Transaction>>(),
    pendingTransactions: new Map<Currency, Array<string>>(),
    isInitialized: false,
  });

  export type ContextType = {
    state: State;
    dispatch: Dispatch<any>;
  };

  export const Context = createContext<ContextType>({
    state: initialState(),
    dispatch: () => null,
  });

  export function reducer(prevState: State, action: any): State {
    let copy: State = Object.assign({}, prevState);

    switch (action.type) {
      case Action.SET:
        copy.transactions = action.txs;
        copy.pendingTransactions = action.pendingTxs;
        copy.isInitialized = true;
        return copy;
      case Action.SET_TX:
        if (!copy.transactions.has(action.currency)) {
          copy.transactions.set(
            action.currency,
            new Map<string, Transaction>(),
          );
        }

        copy.transactions.get(action.currency)?.set(action.tx.id, action.tx);

        DB.setTx(action.currency, action.tx);
        return copy;
      case Action.ADD_PENDING_TXS:
        if (!copy.pendingTransactions.has(action.currency)) {
          copy.pendingTransactions.set(action.currency, []);
        }

        copy.pendingTransactions.get(action.currency)?.push(action.hash);
        DB.setPendingTxs(
          action.currency,
          copy.pendingTransactions.get(action.currency)!,
        );
        return copy;
      case Action.REMOVE_PENDING_TXS:
        copy.pendingTransactions.get(action.currency)?.splice(action.index, 1);

        DB.setPendingTxs(
          action.currency,
          copy.pendingTransactions.get(action.currency)!,
        );
        return copy;
      default:
        return prevState;
    }
  }

  export const set = (
    txs: Map<Currency, Map<string, Transaction>>,
    pendingTxs: Map<Currency, Array<string>>,
  ) => ({
    type: Action.SET,
    txs: txs,
    pendingTxs: pendingTxs,
  });
  export const setTx = (currency: Currency, tx: Transaction) => ({
    type: Action.SET_TX,
    tx: tx,
    currency: currency,
  });
  export const addPendingTx = (currency: Currency, hash: string) => ({
    type: Action.ADD_PENDING_TXS,
    hash: hash,
    currency: currency,
  });
  export const removePendingTx = (currency: Currency, index: number) => ({
    type: Action.REMOVE_PENDING_TXS,
    index: index,
    currency: currency,
  });
}
export default TransactionsStore;
