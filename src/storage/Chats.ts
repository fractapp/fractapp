import {createContext, Dispatch} from 'react';
import {Transaction} from 'models/transaction';
import DB from 'storage/DB';
import {ChatInfo} from 'models/chatInfo';

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
    chats: Map<string, Map<string, Transaction>>;
    chatsInfo: Map<string, ChatInfo>;
  };
  export const initialState = {
    chats: new Map<string, Map<string, Transaction>>(),
    chatsInfo: new Map<string, ChatInfo>(),
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
    let copy = Object.assign({}, prevState);
    switch (action.type) {
      case Action.SET:
        copy.chats = action.chats;
        copy.chatsInfo = action.chatsInfo;
        return copy;
      case Action.SET_CHAT_INFO:
        copy.chatsInfo.set(action.member, action.chatInfo);

        DB.setChatsInfo(copy.chatsInfo);
        return copy;
      case Action.ADD_TX_IN_CHAT:
        if (!copy.chats.has(action.member)) {
          copy.chats.set(action.member, new Map<string, Transaction>());
        }

        const chat = copy.chats.get(action.member);
        chat?.set(action.tx.id, action.tx);
        DB.setChat(action.member, chat);
        return copy;
      case Action.RESET_NOTIFICATION:
        const chatInfo = copy.chatsInfo.get(action.member);
        chatInfo.notificationCount = 0;
        DB.setChatsInfo(copy.chatsInfo);
        return copy;
      default:
        return prevState;
    }
  }

  export const set = (
    chats: Map<string, Map<string, Transaction>>,
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
  export const addTxInChat = (member: string, tx: Transaction) => ({
    type: Action.ADD_TX_IN_CHAT,
    member: member,
    tx: tx,
  });
  export const resetNotification = (member: string) => ({
    type: Action.RESET_NOTIFICATION,
    member: member,
  });
}
export default ChatsStore;
