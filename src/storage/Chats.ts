import {createContext, Dispatch} from 'react';
import DB from 'storage/DB';
import {ChatInfo} from 'models/chatInfo';
import {Currency} from 'models/wallet';

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
  export const initialState = {
    chats: new Map<string, Map<string, Currency>>(),
    chatsInfo: new Map<string, ChatInfo>(),
    isInitialized: false,
  };

  export type ContextType = {
    state: State;
    dispatch: Dispatch<any>;
  };

  export const Context = createContext<ContextType>({
    state: initialState,
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
        copy.chatsInfo.set(action.member, action.chatInfo);

        DB.setChatsInfo(copy.chatsInfo);
        return copy;
      case Action.ADD_TX_IN_CHAT:
        if (!copy.chats.has(action.member)) {
          copy.chats.set(action.member, new Map<string, Currency>());
        }

        const chat = copy.chats.get(action.member)!;
        chat.set(action.id, action.currency);
        DB.setChat(action.member, chat);
        return copy;
      case Action.RESET_NOTIFICATION:
        const chatInfo = copy.chatsInfo.get(action.member);
        if (chatInfo === undefined) {
          throw 'invalid chat info (reducer)';
        }

        chatInfo.notificationCount = 0;
        DB.setChatsInfo(copy.chatsInfo);
        return copy;
      default:
        return prevState;
    }
  }

  export const set = (
    chats: Map<string, Map<string, boolean>>,
    chatsInfo: Map<string, ChatInfo>,
  ) => ({
    type: Action.SET,
    chats: chats,
    chatsInfo: chatsInfo,
  });

  export const setChatInfo = (member: string, chatInfo: ChatInfo) => ({
    type: Action.SET_CHAT_INFO,
    member: member,
    chatInfo: chatInfo,
  });
  export const addTxInChat = (
    member: string,
    id: string,
    currency: Currency,
  ) => ({
    type: Action.ADD_TX_IN_CHAT,
    member: member,
    id: id,
    currency: currency,
  });
  export const resetNotification = (member: string) => ({
    type: Action.RESET_NOTIFICATION,
    member: member,
  });
}
export default ChatsStore;
