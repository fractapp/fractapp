import DB from 'storage/DB';
import { ChatInfo } from 'types/chatInfo';
import { Currency } from 'types/wallet';
import { Transaction, TxStatus } from 'types/transaction';
import { Message } from 'types/message';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * @namespace
 * @category Storage
 */
namespace ChatsStore {
  export type TxId = string;
  export type MsgId = string;
  export type PendingTxs = {
    idsOfTransactions: Array<TxId>;
  };
  export type TxInfo = {
    currency: Currency;
  };
  export type Transactions = {
    transactionById: Record<TxId, Transaction>;
  };
  export type TransactionsByChat = {
    infoById: {
      [id in TxId]: TxInfo
    };
    messages:  {
      [id in MsgId]: Message
    }
  };

  export type State = {
    chats:  {
      [id in string]: TransactionsByChat
    },
    chatsInfo:  {
      [id in string]: ChatInfo
    },
    transactions: {
      [id in Currency]: Transactions
    },
    pendingTransactions: {
      [id in Currency]: PendingTxs
    },
    sentFromFractapp: {
      [id in TxId]: boolean
    },
    totalNotifications: number;
    isInitialized: boolean;
  };

  export const initialState = (): State => <State>({
    chats: {},
    chatsInfo: {},
    transactions: {},
    pendingTransactions: {},
    sentFromFractapp: {},
    totalNotifications: 0,
    isInitialized: false,
  });

  const slice = createSlice({
    name: 'chats',
    initialState: initialState(),
    reducers: {
      set(state: State, action: PayloadAction<State>): State {
        return action.payload;
      },
      addMessage(state: State, action: PayloadAction<{
        chatId: string,
        msg: Message
      }>): State {
        const msgChatId: string = action.payload.chatId;
        const msg: Message = action.payload.msg;

        if (!state.chatsInfo[msgChatId]) {
          const newChatInfo: ChatInfo = {
            id: msgChatId,
            notificationCount: 1,
            lastMsgId: msg.id,
          };
          state.chatsInfo[newChatInfo.id] = newChatInfo;
        }

        if (!state.chats[msgChatId]) {
          state.chats[msgChatId] = {
            infoById: {},
            messages: {},
          };
        }

        const chat = state.chats[msgChatId]!;
        chat.messages[msg.id] = msg;

        const chatInfo = state.chatsInfo[msgChatId]!;
        if (msg.timestamp >
          chat.messages[chatInfo.lastMsgId]!.timestamp
        ) {
          chatInfo.lastMsgId = msg.id;
          chatInfo.notificationCount++;
          state.totalNotifications++;
        }

        DB.setChatsState(state);
        return state;
      },
      addTx(state: State, action: PayloadAction<{
        tx: Transaction,
        isNotify: boolean
      }>): State {
        const tx: Transaction = action.payload.tx;

        let chatId = tx.address;
        if (tx.userId !== null) {
          chatId = tx.userId;
        }

        // add transaction
        if (!state.transactions[tx.currency]) {
          state.transactions[tx.currency] = {
            transactionById: {},
          };
        }
        state.transactions[tx.currency]!.transactionById[tx.id] = tx;

        // add txInfo to chat
        if (!state.chats[chatId]) {
          state.chats[chatId] = {
            infoById: {},
            messages: {},
          };
        }
        state.chats[chatId]!.infoById[tx.id] = {
          currency: tx.currency,
        };

        DB.setChatsState(state);
        return state;
      },
      addPendingTx(state: State, action: PayloadAction<Transaction>): State {
        const pendingTx: Transaction = action.payload;
        if (!state.pendingTransactions[pendingTx.currency]) {
          state.pendingTransactions[pendingTx.currency] = {
            idsOfTransactions: [],
          };
        }
        state.pendingTransactions[pendingTx.currency]!
          .idsOfTransactions.push(pendingTx.id);
        state.sentFromFractapp[pendingTx.id] = true;

        const newPayload: PayloadAction<{
          tx: Transaction,
          isNotify: boolean
        }> = {
          payload: {
            tx: pendingTx,
            isNotify: false,
          },
          type: '',
        };
        return this.addTx(state, newPayload);
      },
      confirmPendingTx(state: State, action: PayloadAction<{
        txId: TxId,
        currency: Currency,
        status: TxStatus,
        index: number
      }>): State {
        const pendingTxId: TxId = action.payload.txId;
        const currency: Currency = action.payload.currency;
        const txStatus: TxStatus = action.payload.status;
        const index: number = action.payload.index;

        const pTx = state.transactions
          [currency]!
          .transactionById[pendingTxId]!;

        pTx.status = txStatus;
        state.transactions[pTx.currency]!.transactionById[pTx.id] = pTx;

        let newPTxs =
          state.pendingTransactions[currency]?.idsOfTransactions!;

        newPTxs.splice(index, 1);
        state.pendingTransactions[currency] = {
          idsOfTransactions: newPTxs,
        };

        DB.setChatsState(state);
        return state;
      },
      removeNotification(state: State, action: PayloadAction<string>) {
        const chatIdForNotification: string = action.payload;
        const info = state.chatsInfo[chatIdForNotification]!;

        state.totalNotifications -= info.notificationCount;
        info.notificationCount = 0;
        state.chatsInfo[chatIdForNotification] = info;

        DB.setChatsState(state);
        return state;
      },
    },
  });

  export const actions = slice.actions;
  export const reducer = slice.reducer;
}
export default ChatsStore;
