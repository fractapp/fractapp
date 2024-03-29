import DB from 'storage/DB';
import { ChatInfo } from 'types/chatInfo';
import { Currency, fromCurrency, getSymbol } from 'types/wallet';
import { Transaction, TxAction, TxStatus, TxType } from 'types/transaction';
import { Message } from 'types/message';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import StringUtils from 'utils/string';
import { getTxName } from 'types/inputs';

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

  const addTx = (state: State, owner: string, tx: Transaction, isNotify: boolean): State => {
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

    if (tx.action === TxAction.StakingReward || tx.action === TxAction.StakingWithdrawn) {
      return state;
    }

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

    let sender = owner;
    let receiver = chatId;
    switch (tx.txType) {
      case TxType.Out:
      case TxType.None:
        sender = owner;
        receiver = chatId;
        break;
      case TxType.In:
        sender = chatId;
        receiver = owner;
        break;
    }

    let value = '';
    let amount = (tx.usdValue !== 0
      ? ` $${tx.usdValue}`
      : ` ${tx.value} ${getSymbol(tx.currency)}`);

    if (tx.action === TxAction.Transfer) {
      switch (tx.txType) {
        case TxType.None:
          value = 'Transaction'; //TODO: string
          break;
        case TxType.Out:
          value = StringUtils.texts.YouSentTitle + amount;
          break;
        case TxType.In:
          value = StringUtils.texts.YouReceivedTitle + amount;
          break;
      }
    } else {
      value = getTxName(tx.action);
    }

    state = addMessage(state, chatId, {
      id: tx.id,
      value: value,
      action: '/tx',
      args: {
        currency: fromCurrency(tx.currency),
        id: tx.id,
      },
      rows: [],
      timestamp: tx.timestamp,
      sender: sender,
      receiver: receiver,
      hideBtn: false,
    }, isNotify);

    return state;
  };

  const addMessage = (state: State, chatId: string, message: Message, isNotify: boolean): State => {
    let isNew = false;
    if (!state.chatsInfo[chatId]) {
      isNew = true;
      state.chatsInfo[chatId] = {
        id: chatId,
        notificationCount: 0,
        lastMsgId: message.id,
      };
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
    if (
      chatInfo.lastMsgId == null ||
      message.timestamp > chat.messages[chatInfo.lastMsgId]!.timestamp
      || isNew
    ) {
      chatInfo.lastMsgId = message.id;

      if (isNotify) {
        chatInfo.notificationCount++;
        state.totalNotifications++;
      }
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
      addEmptyChat(state: State, action: PayloadAction<{
        chatId: string
      }>): State {
        const chatId = action.payload.chatId;
        state.chats[chatId] = {
          infoById: {},
          messages: {},
        };
        state.chatsInfo[chatId] = {
          id: chatId,
          notificationCount: 0,
          lastMsgId: null,
        };

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

          state = addMessage(state, msgChatId, msg, true);
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
        const isNotify: boolean = action.payload.isNotify;

        console.log('isNotify: ' + isNotify);
        state = addTx(state, owner, tx, isNotify);
        DB.setChatsState(state);
        return state;
      },
      addTxs(state: State, action: PayloadAction<{
        txs: Array<Transaction>,
        isNotify: boolean
        owner: string,
      }>): State {
        const txs: Array<Transaction> = action.payload.txs;
        const owner: string = action.payload.owner;
        const isNotify: boolean = action.payload.isNotify;

        console.log('isNotify: ' + isNotify);
        for (let tx of txs) {
          state = addTx(state, owner, tx, isNotify);
        }
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

        state = addTx(state,owner, pendingTx, false);
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

        const confirmedTx = state.transactions[currency]!
          .transactionById[pendingTxId]!;

        confirmedTx.status = txStatus;
        state.transactions[confirmedTx.currency]!.transactionById[confirmedTx.id] = confirmedTx;

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
      removeChat(state: State, action: PayloadAction<string>) {
        const deleteChatId: string = action.payload;

        state.totalNotifications -= state.chatsInfo[deleteChatId]!.notificationCount;
        state.chatsInfo[deleteChatId].notificationCount = 0;
        state.chatsInfo[deleteChatId].lastMsgId = null;
        state.chats[deleteChatId] = { infoById: {}, messages: {} };

        DB.setChatsState(state);
        return state;
      },
    },
  });

  export const actions = slice.actions;
  export const reducer = slice.reducer;
}
export default ChatsStore;
