// @ts-ignore
import {FRACTAPP_WS} from '@env';
import ChatsStore from 'storage/Chats';
import api from 'utils/api';
import { Profile } from 'types/profile';
import { Message, MessageRq, MessagesInfo, UndeliveredMessagesInfo } from 'types/message';
import { randomAsHex } from '@polkadot/util-crypto';
import { Dispatch } from 'redux';
import UsersStore from 'storage/Users';

/**
 * @namespace
 * @category Utils
 */
export class WebsocketApi {
  private static api: WebsocketApi | null;

  private wsConnection: WebSocket | null;
  private isWsForceClosed = false;
  private dispatch: Dispatch<any>

  constructor(dispatch: Dispatch<any> ) {
    this.dispatch = dispatch;
    this.wsConnection = null;
  }

  public static getWsApi(dispatch: Dispatch<any> | null = null) {
      if (WebsocketApi.api == null) {
        if (dispatch == null) {
          throw ('dispatcher equals null');
        }
        WebsocketApi.api = new WebsocketApi(dispatch!);
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

    this.dispatch(UsersStore.actions.setUser({
      isAddressOnly: false,
      title: user.name === '' ? user.username : user.name,
      value: user,
    }));

    for (let message of messages) {
      console.log('message getted: ' + Date.now());
      this.dispatch(ChatsStore.actions.addMessage({
        chatId: message.sender,
        msg: message,
      }));
    }
  }
  private undeliveredMessages(messagesInfo: UndeliveredMessagesInfo) {
    console.log('MessageWs: ' + JSON.stringify(messagesInfo));
    const users = messagesInfo.users;
    const messages: Array<Message> = messagesInfo.messages;

    for (let [key, user] of Object.entries(users)) {
      this.dispatch(UsersStore.actions.setUser({
        isAddressOnly: false,
        title: user.name === '' ? user.username : user.name,
        value: user,
      }));
    }

    for (let message of messages) {
      this.dispatch(ChatsStore.actions.addMessage({
        chatId: message.sender,
        msg: message,
      }));
    }
  }

}


export default WebsocketApi;
