import {createContext, Dispatch} from 'react';
import DB from 'storage/DB';
import {ChatInfo, ChatType} from 'types/chatInfo';
import {Currency} from 'types/wallet';
import {Transaction, TxStatus} from 'types/transaction';
import {UserProfile} from 'types/profile';

/**
 * @namespace
 * @category Storage
 */
namespace ChatsStore {
  export enum Action {
    SET,
    ADD_TX,
    ADD_PENDING_TX,
    CONFIRM_PENDING_TX,
    REMOVE_NOTIFICATION,
    RENAME_CHAT,
  }

  export type TxId = string;
  export type PendingTxs = {
    idsOfTransactions: Array<TxId>;
  };
  export type TxInfo = {
    currency: Currency;
  };

  export type Transactions = {
    transactionById: Map<TxId, Transaction>;
  };
  export type TransactionsByChat = {
    infoById: Map<TxId, TxInfo>;
  };

  export type State = {
    chats: Map<string, TransactionsByChat>;
    chatsInfo: Map<string, ChatInfo>;
    transactions: Map<Currency, Transactions>;
    pendingTransactions: Map<Currency, PendingTxs>;
    sentFromFractapp: Map<TxId, boolean>;
    totalNotifications: number;
    isInitialized: boolean;
  };

  export const initialState = (): State => ({
    chats: new Map<string, TransactionsByChat>(),
    chatsInfo: new Map<string, ChatInfo>(),
    transactions: new Map<Currency, Transactions>(),
    pendingTransactions: new Map<Currency, PendingTxs>(),
    sentFromFractapp: new Map<TxId, boolean>(),
    totalNotifications: 0,
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

  export const set = (state: State) => ({
    type: Action.SET,
    state: state,
  });

  export const addTx = (
    tx: Transaction,
    isNotify: boolean,
    user?: UserProfile | null,
  ) => ({
    type: Action.ADD_TX,
    tx: tx,
    user: user,
    isNotify: isNotify,
  });

  export const addPendingTx = (tx: Transaction, user?: UserProfile) => ({
    type: Action.ADD_PENDING_TX,
    tx: tx,
    user: user,
    isNotify: false,
  });

  export const confirmPendingTx = (
    txId: TxId,
    status: TxStatus,
    currency: Currency,
    index: number,
  ) => ({
    type: Action.CONFIRM_PENDING_TX,
    txId: txId,
    status: status,
    currency: currency,
    index: index,
  });

  export const removeNotification = (chatId: string) => ({
    type: Action.REMOVE_NOTIFICATION,
    chatId: chatId,
  });

  export const renameChat = (chatId: string, newName: string) => ({
    type: Action.RENAME_CHAT,
    chatId: chatId,
    name: newName,
  });

  export function reducer(prevState: State, action: any): State {
    let copy: State = Object.assign({}, prevState);
    switch (action.type) {
      case Action.SET:
        return action.state;
      case Action.ADD_PENDING_TX:
        const pendingTx: Transaction = action.tx;
        if (!copy.pendingTransactions.has(pendingTx.currency)) {
          copy.pendingTransactions.set(pendingTx.currency, {
            idsOfTransactions: [],
          });
        }
        copy.pendingTransactions
          .get(pendingTx.currency)!
          .idsOfTransactions.push(pendingTx.id);
        copy.sentFromFractapp.set(pendingTx.id, true); //Without break; Got to ADD_TX
      // eslint-disable-next-line no-fallthrough
      case Action.ADD_TX:
        const tx: Transaction = action.tx;
        const user: UserProfile | undefined = action.user;
        const isNotify: boolean = action.isNotify;

        let isChatWithUser = false;
        let chatId = tx.address;
        if (tx.userId !== null) {
          chatId = tx.userId;
          isChatWithUser = true;
        }

        // add short chat info
        if (!copy.chatsInfo.has(chatId)) {
          let name = tx.address;
          if (isChatWithUser && user !== null) {
            name =
              user!.name !== undefined && user!.name !== ''
                ? user!.name
                : user!.username;
          }

          const newChatInfo: ChatInfo = {
            id: chatId,
            name: name,
            lastTxId: tx.id,
            lastTxCurrency: tx.currency,
            notificationCount: 0,
            timestamp: tx.timestamp,
            type:
              isChatWithUser && user != null
                ? ChatType.WithUser
                : ChatType.AddressOnly,
            details:
              isChatWithUser && user != null
                ? null
                : {
                    currency: tx.currency,
                    address: tx.address,
                  },
          };
          copy.chatsInfo.set(newChatInfo.id, newChatInfo);
        }
        const chatInfo = copy.chatsInfo.get(chatId)!;
        if (
          tx.id !== chatInfo.lastTxId &&
          tx.timestamp >
            copy.transactions
              .get(chatInfo.lastTxCurrency)
              ?.transactionById?.get(chatInfo.lastTxId)?.timestamp!
        ) {
          chatInfo.lastTxId = tx.id;
          chatInfo.lastTxCurrency = tx.currency;
          chatInfo.timestamp = tx.timestamp;
        }

        if (isNotify) {
          chatInfo.notificationCount++;
          copy.totalNotifications++;
        }

        copy.chatsInfo.set(chatInfo.id, chatInfo);

        // add transaction
        if (!copy.transactions.has(tx.currency)) {
          copy.transactions.set(tx.currency, {
            transactionById: new Map<TxId, Transaction>(),
          });
        }
        copy.transactions.get(tx.currency)!.transactionById.set(tx.id, tx);

        // add txInfo to chat
        if (!copy.chats.has(chatId)) {
          copy.chats.set(chatId, {
            infoById: new Map<TxId, TxInfo>(),
          });
        }
        copy.chats.get(chatId)!.infoById.set(tx.id, {
          currency: tx.currency,
        });

        DB.setChatsState(copy);
        return copy;
      case Action.CONFIRM_PENDING_TX:
        const pendingTxId: TxId = action.txId;
        const currency: Currency = action.currency;
        const txStatus: TxStatus = action.status;
        const index: number = action.index;

        const pTx = copy.transactions
          .get(currency)!
          .transactionById.get(pendingTxId)!;

        pTx.status = txStatus;
        copy.transactions.get(pTx.currency)!.transactionById.set(pTx.id, pTx);

        let newPTxs =
          copy.pendingTransactions.get(currency)?.idsOfTransactions!;

        newPTxs.splice(index, 1);
        copy.pendingTransactions.set(currency, {
          idsOfTransactions: newPTxs,
        });

        DB.setChatsState(copy);
        return copy;
      case Action.REMOVE_NOTIFICATION:
        const chatIdForNotification: string = action.chatId;
        const info = copy.chatsInfo.get(chatIdForNotification)!;

        copy.totalNotifications -= info.notificationCount;
        info.notificationCount = 0;
        copy.chatsInfo.set(chatIdForNotification, info);

        DB.setChatsState(copy);
        return copy;
      case Action.RENAME_CHAT:
        copy.chatsInfo.get(action.chatId)!.name = action.name;

        DB.setChatsState(copy);
        return copy;
      default:
        return prevState;
    }
  }
}
export default ChatsStore;
