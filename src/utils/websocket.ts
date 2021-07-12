// @ts-ignore
import {FRACTAPP_WS} from '@env';
import ChatsStore from 'storage/Chats';
import api from 'utils/api';
import Global from 'storage/Global';
import GlobalStore from 'storage/Global';
import { Profile } from 'types/profile';
import stringUtils from 'utils/string';
import { Message, MessageRq, MessagesInfo, UndeliveredMessagesInfo } from 'types/message';
import AccountsStore from 'storage/Accounts';
import { randomAsHex } from '@polkadot/util-crypto';

/**
 * @namespace
 * @category Utils
 */
export class WebsocketApi {
  private static api: WebsocketApi | null;

  private wsConnection: WebSocket | null;
  private isWsForceClosed = false;
  private chatsContext: ChatsStore.ContextType
  private globalContext: GlobalStore.ContextType
  private accountContext: AccountsStore.ContextType

  constructor(globalContext: GlobalStore.ContextType, chatsContext: ChatsStore.ContextType, accountContext: AccountsStore.ContextType) {
    this.globalContext = globalContext;
    this.chatsContext = chatsContext;
    this.accountContext = accountContext;
    this.wsConnection = null;
  }

  public static getWsApi(globalContext: GlobalStore.ContextType | null = null,
                         chatsContext: ChatsStore.ContextType | null = null,
                         accountContext: AccountsStore.ContextType | null = null) {
      if (WebsocketApi.api == null) {
        if (chatsContext == null || globalContext == null) {
          throw ('chats or global context equals null');
        }
        WebsocketApi.api = new WebsocketApi(globalContext!, chatsContext!, accountContext!);
      }

      return this.api!;
  }

  public async open() {
    const jwt = await api.getJWT();

    this.isWsForceClosed = false;
    this.wsConnection = new WebSocket(`${FRACTAPP_WS}?jwt=${jwt}`);

    this.wsConnection.onopen = function() {
      console.log('WS Fractapp connected...');
    };

    const thisApi = this;
    this.wsConnection.onmessage = function(e) {
      const rs = JSON.parse(e.data);
      thisApi.onMessage(rs);
    };

    this.wsConnection.onclose = function(e) {
      if (thisApi.isWsForceClosed) {
        return;
      }
      console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
      setTimeout(function() {
        thisApi.open();
      }, 5000);
    };

    this.wsConnection.onerror = function(err) {
      console.error('Socket encountered error: ', err.message, 'Closing socket');
    };
  }


  public sendMsg(msgRq: MessageRq): Promise<void> {
    return new Promise<void>((resolve => {
      this.wsConnection?.send(JSON.stringify({
        id: randomAsHex(32),
        method: 'message',
        message: msgRq,
      }));

      setTimeout(() => resolve(), 1000);
    }));
  }

  private onMessage(wsMessage: any) {
    switch (wsMessage.method) {
      case 'message':
        this.message(wsMessage.value);
        break;
      case 'undelivered':
        this.undeliveredMessages(wsMessage.value);
        break;
    }
  }

  public close() {
    this.isWsForceClosed = true;
    this.wsConnection!.close();
    console.log('Fractapp WS disconnected');
  }

  private message(messagesInfo: MessagesInfo) {
    const user: Profile = messagesInfo.user;
    const messages: Array<Message> = messagesInfo.messages;

    user.addresses = stringUtils.objectToMap(user.addresses);
    this.globalContext.dispatch(Global.setUser({
      isAddressOnly: false,
      title: user.name === '' ? user.username : user.name,
      value: user,
    }));

    for (let message of messages) {
      this.chatsContext.dispatch(ChatsStore.addMsg(message.sender, message));
    }
  }
  private undeliveredMessages(messagesInfo: UndeliveredMessagesInfo) {
    const users: Map<string, Profile> = stringUtils.objectToMap(messagesInfo.users);
    const messages: Array<Message> = messagesInfo.messages;

    for (let [key, user] of users) {
      user.addresses = stringUtils.objectToMap(user.addresses);
      this.globalContext.dispatch(Global.setUser({
        isAddressOnly: false,
        title: user.name === '' ? user.username : user.name,
        value: user,
      }));
    }

    for (let message of messages) {
      this.chatsContext.dispatch(ChatsStore.addMsg(message.sender, message));
    }
  }

}


export default WebsocketApi;
