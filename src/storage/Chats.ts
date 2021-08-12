import DB from 'storage/DB';
import { ChatInfo } from 'types/chatInfo';
import { Currency, fromCurrency, getSymbol } from 'types/wallet';
import { Transaction, TxStatus, TxType } from 'types/transaction';
import { Message } from 'types/message';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import StringUtils from 'utils/string';

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
    transactionById:
      {
        [id in TxId]: Transaction
      };
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

  const addTx = (state: State, owner: string, tx: Transaction): State => {
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

    state = addMessage(state, chatId, {
      id: tx.id,
      value: (tx.txType === TxType.Sent
        ? StringUtils.texts.YouSentTitle
        : StringUtils.texts.YouReceivedTitle) +
        (tx.usdValue !== 0
          ? ` $${tx.usdValue}`
          : ` ${tx.value} ${getSymbol(tx.currency)}`),
      action: '/tx',
      args: [
        fromCurrency(tx.currency),
        tx.id,
      ],
      rows: [],
      timestamp: tx.timestamp,
      sender: tx.txType === TxType.Sent ? owner : chatId,
      receiver: tx.txType === TxType.Sent ? chatId : owner,
      hideBtn: false,
    });
    return state;
  };

  const addMessage = (state: State, chatId: string, message: Message): State => {
    if (!state.chatsInfo[chatId]) {
      const newChatInfo: ChatInfo = {
        id: chatId,
        notificationCount: 1,
        lastMsgId: message.id,
      };
      state.totalNotifications++;
      state.chatsInfo[newChatInfo.id] = newChatInfo;
    }

    if (!state.chats[chatId]) {
      state.chats[chatId] = {
        infoById: {},
        messages: {},
      };
    }

    const chat = state.chats[chatId]!;

    if (chat.messages[message.id]) {
      console.log('message is exist');
      return state;
    }

    chat.messages[message.id] = message;

    const chatInfo = state.chatsInfo[chatId]!;
    if (message.timestamp >
      chat.messages[chatInfo.lastMsgId]!.timestamp
    ) {
      chatInfo.lastMsgId = message.id;
      chatInfo.notificationCount++;
      state.totalNotifications++;
    }

    return state;
  };

  const slice = createSlice({
    name: 'chats',
    initialState: initialState(),
    reducers: {
      set(state: State, action: PayloadAction<State>): State {
        return action.payload;
      },
      hideBtns(state: State, action: PayloadAction<{
        chatId: string,
        msgId: string
      }>): State {
        state.chats[action.payload.chatId].messages[action.payload.msgId].hideBtn = true;
        DB.setChatsState(state);
        return state;
      },
      addMessages(state: State, action: PayloadAction<Array<{
        chatId: string,
        msg: Message
      }>>): State {
        for (const payload of action.payload) {
          const msgChatId: string = payload.chatId;
          const msg: Message = payload.msg;

          state = addMessage(state, msgChatId, msg);
        }
        DB.setChatsState(state);
        return state;
      },
      addTx(state: State, action: PayloadAction<{
        tx: Transaction,
        owner: string,
        isNotify: boolean
      }>): State {
        const tx: Transaction = action.payload.tx;
        const owner: string = action.payload.owner;

        state = addTx(state, owner, tx);
        DB.setChatsState(state);
        return state;
      },
      addPendingTx(state: State, action: PayloadAction<{
        tx: Transaction,
        owner: string
      }>): State {
        const pendingTx: Transaction = action.payload.tx;
        const owner: string = action.payload.owner;

        if (!state.pendingTransactions[pendingTx.currency]) {
          state.pendingTransactions[pendingTx.currency] = {
            idsOfTransactions: [],
          };
        }
        state.pendingTransactions[pendingTx.currency]!
          .idsOfTransactions.push(pendingTx.id);
        state.sentFromFractapp[pendingTx.id] = true;

        state = addTx(state,owner, pendingTx);
        DB.setChatsState(state);
        return state;
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
