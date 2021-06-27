// @ts-ignore
import {FRACTAPP_WS} from '@env';
import ChatsStore from 'storage/Chats';
import api from 'utils/api';
import Global from 'storage/Global';
import GlobalStore from 'storage/Global';
import { Profile } from 'types/profile';
import stringUtils from 'utils/string';
import { Message, MessageAction, MessagesInfo } from 'types/message';
import { Transaction } from 'types/transaction';
import { toCurrency } from 'types/wallet';
import tasks from 'utils/tasks';
import AccountsStore from 'storage/Accounts';

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

    const onMessage = this.onMessage;
    this.wsConnection.onmessage = function(e) {
      const rs = JSON.parse(e.data);
      console.log(rs);
      onMessage(rs);
    };

    this.wsConnection.onclose = function(e) {
      const api = WebsocketApi.getWsApi();
      if (api.isWsForceClosed) {
        return;
      }
      console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
      setTimeout(function() {
        api.open();
      }, 5000);
    };

    this.wsConnection.onerror = function(err) {
      const api = WebsocketApi.getWsApi();
      console.error('Socket encountered error: ', err.message, 'Closing socket');
      api!.close();
    };
  }

  private onMessage(wsMessage: any) {
    switch (wsMessage.method) {
      case 'message':
        this.message(wsMessage.value);
        break;
    }
  }

  private message(messagesInfo: MessagesInfo) {
    const users: Map<string, Profile> = stringUtils.objectToMap(messagesInfo.users);
    const messages: Array<Message> = messagesInfo.messages;
    const transactions: Map<string, Transaction> = stringUtils.objectToMap(messagesInfo.transactions);

    for (let [key, user] of users) {
      user.addresses = stringUtils.objectToMap(user.addresses);
      this.globalContext.dispatch(Global.setUser({
        isAddressOnly: false,
        title: user.name === '' ? user.username : user.name,
        value: user,
      }));
    }

    for (let message of messages) {
      if (message.value.startsWith('/')) {
        const action = message.value.substring(1);
        switch (action) {
          case MessageAction.AddTxToChat:
            if (message.sender !== '') {
              break;
            }

            const currency = toCurrency(message.args[0]);
            const txId = message.args[1];

            if (!transactions.has(txId) || !messagesInfo.transactions.has(txId)) {
              break;
            }

            const existTxs = this.chatsContext.state.transactions.get(currency)!;
            if (
              existTxs.transactionById.has(txId) ||
              existTxs.transactionById.has('sent-' + txId)
            ) {
              break;
            }

            const tx = messagesInfo.transactions.get(txId)!;

            tasks.setTx(this.globalContext, this.chatsContext, tx);
            break;
          default:
            this.addMsgToChat(message);
            break;
        }
      } else {
        this.addMsgToChat(message);
      }
    }
  }

  private addMsgToChat(message: Message) {
    this.chatsContext.dispatch({
      type: ChatsStore.Action.ADD_MESSAGE,
      msg: {
        id: message.id,
        value: message.value,
        timestamp: message.timestamp,
      },
      chatId: message.sender,
    });
  }


  public close() {
    this.isWsForceClosed = true;
    this.wsConnection!.close();
    console.log('Fractapp WS disconnected');
  }
}


export default WebsocketApi;
