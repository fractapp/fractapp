import {createContext, Dispatch} from 'react';
import DB from 'storage/DB';
import {ChatInfo} from 'types/chatInfo';
import {Currency} from 'types/wallet';

/**
 * @namespace
 * @category Context storage
 */
namespace ChatsStore {
  export enum Action {
    SET,
    SET_CHAT_INFO,
    ADD_TX_IN_CHAT,
    RESET_NOTIFICATION,
  }

  export type State = {
    chats: Map<string, Map<string, Currency>>;
    chatsInfo: Map<string, ChatInfo>;
    isInitialized: boolean;
  };
  export const initialState = (): State => ({
    chats: new Map<string, Map<string, Currency>>(),
    chatsInfo: new Map<string, ChatInfo>(),
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
        copy.chats = action.chats;
        copy.chatsInfo = action.chatsInfo;
        copy.isInitialized = true;
        return copy;
      case Action.SET_CHAT_INFO:
        copy.chatsInfo.set(action.id, action.chatInfo);

        DB.setChatsInfo(copy.chatsInfo);
        return copy;
      case Action.ADD_TX_IN_CHAT:
        if (!copy.chats.has(action.chatId)) {
          copy.chats.set(action.chatId, new Map<string, Currency>());
        }

        const chat = copy.chats.get(action.chatId)!;
        chat.set(action.txId, action.currency);
        DB.setChat(action.chatId, chat);
        return copy;
      case Action.RESET_NOTIFICATION:
        const chatInfo = copy.chatsInfo.get(action.chatId);
        if (chatInfo === undefined) {
          throw new Error('invalid chat info (reducer)');
        }

        chatInfo.notificationCount = 0;
        DB.setChatsInfo(copy.chatsInfo);
        return copy;
      default:
        return prevState;
    }
  }

  export const set = (
    chats: Map<string, Map<string, Currency>>, // chatId : txId : Currency
    chatsInfo: Map<string, ChatInfo>, // chatId : ChatInfo
  ) => ({
    type: Action.SET,
    chats: chats,
    chatsInfo: chatsInfo,
  });

  export const setChatInfo = (id: string, chatInfo: ChatInfo) => ({
    type: Action.SET_CHAT_INFO,
    id: id,
    chatInfo: chatInfo,
  });
  export const addTxInChat = (
    chatId: string,
    txId: string,
    currency: Currency,
  ) => ({
    type: Action.ADD_TX_IN_CHAT,
    chatId: chatId,
    txId: txId,
    currency: currency,
  });
  export const resetNotification = (chatId: string) => ({
    type: Action.RESET_NOTIFICATION,
    chatId: chatId,
  });
}
export default ChatsStore;
