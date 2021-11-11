// @ts-ignore
import {WSFRACTAPP_API, MAIN_BOT_ID} from '@env';
import ChatsStore from 'storage/Chats';
import api from 'utils/fractappClient';
import { Profile, User } from 'types/profile';
import {
  DefaultMsgAction,
  Message,
  TxStatusApi, WsBalanceUpdate,
  WsResponse,
  WsTransaction,
  WsUpdate,
} from 'types/message';
import { Dispatch, Store } from 'redux';
import UsersStore from 'storage/Users';
import { Transaction, TxAction, TxStatus } from 'types/transaction';
import { Currency, getNetwork } from 'types/wallet';
import math from 'utils/math';
import BN from 'bn.js';
import { Adaptors } from 'adaptors/adaptor';
import { AccountType, BalanceRs } from 'types/account';
import AccountsStore from 'storage/Accounts';
import ServerInfoStore from 'storage/ServerInfo';
import MathUtils from 'utils/math';
import Storage from 'storage/Store';
import GlobalStore from 'storage/Global';
import DB from 'storage/DB';
import { Price } from 'types/serverInfo';


const sec = 1000;
const min = 60 * sec;
/**
 * @namespace
 * @category Utils
 */
export class WebsocketClient {
  private static api: WebsocketClient | null;

  private readonly userId: string;
  private readonly dispatch: Dispatch<any>;
  private readonly store: Store;
  private wsConnection: WebSocket | null;
  private isWsForceClosed = false;
  private isConnected = false;

  constructor(store: Store, dispatch: Dispatch<any>, userId: string) {
    this.dispatch = dispatch;
    this.wsConnection = null;
    this.userId = userId;
    this.store = store;
  }

  public static init(store: Store, dispatch: Dispatch<any>, userId: string) {
    if (dispatch == null) {
      throw ('dispatcher equals null');
    }
    if (WebsocketClient.api == null) {
      WebsocketClient.api = new WebsocketClient(store, dispatch!, userId!);
    }
  }

  public static getWsApi() {
    return this.api!;
  }

  private async waitConnect() {
    for (let i = 0; i < 50; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (this.isConnected) {
        return;
      }
    }

    throw new Error('invalid connection to ws');
  }

  public async open() {
    const jwt = await api.getJWT();

    if (jwt == null) {
      return;
    }
    this.isWsForceClosed = false;
    this.wsConnection = new WebSocket(`${WSFRACTAPP_API}/ws/connect?jwt=${jwt}`);

    const thisApi = this;

    this.wsConnection.onopen = function() {
      console.log('WS Fractapp connected...');

      thisApi.isConnected = true;
      const states: Storage.States = thisApi.store.getState();
      if (!states.chats.chatsInfo[MAIN_BOT_ID]) {
        DB.getLastInitMsgTimeout().then(async (last: number | null) => {
          const now = Date.now();
          if (last == null || now > (last! + min * 30)) {
            console.log('send init msg');
            const timestamp = await api.sendMsg({
              value: '',
              action: DefaultMsgAction.Init,
              receiver: MAIN_BOT_ID,
              args: {},
            });
            if (timestamp != null) {
              await DB.setLastInitMsgTimeout(timestamp);
            }
          }
        });
      }
    };

    this.wsConnection.onmessage = function(e) {
      const rs: WsResponse = JSON.parse(e.data);

      thisApi.onMsg(rs);
    };

    this.wsConnection.onclose = function(e) {
      thisApi.isConnected = false;

      if (thisApi.isWsForceClosed) {
        return;
      }

      console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
      setTimeout(function() {
        thisApi.open();
      }, 1000);
    };

    this.wsConnection.onerror = function(err) {
      console.error('Socket encountered error: ', err.message, 'Closing socket');
    };

    await this.waitConnect();
  }

  public close() {
    this.isWsForceClosed = true;
    this.wsConnection!.close();
    console.log('Fractapp WS disconnected');
  }

  private onMsg(wsResponse: WsResponse) {
    console.log('Ws response: ' + JSON.stringify(wsResponse));
    switch (wsResponse.method) {
      case 'update':
        this.update(wsResponse.value as WsUpdate);
        break;
      case 'balances':
        this.balances(wsResponse.value as WsBalanceUpdate);
        break;
      case 'txs_statuses':
        this.txsStatuses(wsResponse.value as Array<TxStatusApi>);
        break;
      case 'users':
        this.users(wsResponse.value as Record<string, Profile>);
        break;
    }
  }

  private txsStatuses(statuses: Array<TxStatusApi>) {
    const statusesMap: Record<string, TxStatusApi> = {};
    for (let tx of statuses) {
      statusesMap[tx.hash] = tx;
    }

    const states: Storage.States = this.store.getState();
    for (let [key, value] of Object.entries(states.chats.pendingTransactions)) {
      let currency: Currency = Number(key);
      for (let i = 0; i < value.idsOfTransactions.length; i++) {
        const tx = states.chats.transactions[currency]?.transactionById[value.idsOfTransactions[i]]!;

        const status = statusesMap[tx.hash];
        if (status === undefined || status.status === TxStatus.Pending) {
          continue;
        }

        this.dispatch(
          ChatsStore.actions.confirmPendingTx({
            txId: tx.id,
            status: status.status,
            currency: tx.currency,
            index: i,
          }),
        );
      }
    }
  }

  private users(rsUsers: Record<string, Profile>) {
    console.log('get users');
    const users: Array<User> = [];
    for (let user of Object.values(rsUsers)) {
      users.push({
        isAddressOnly: false,
        title: user.name === '' ? user.username : user.name,
        value: user,
      });
    }
    this.dispatch(UsersStore.actions.setUsers(users));
  }

  private update(update: WsUpdate) {
    const states: Storage.States = this.store.getState();

    try {
      this.updateUsers(update.users);
    } catch (e) {
      console.log('ws update error: ' + e);
    }
    try {
      this.updateMessages(update.messages);
    } catch (e) {
      console.log('ws update error: ' + e);
    }
    try {
      this.updateTxs(states, update.transactions);
    } catch (e) {
      console.log('ws update error: ' + e);
    }
    try {
      this.updatePrices(update.prices);
    } catch (e) {
      console.log('ws update error: ' + e);
    }

    if (update.notifications.length > 0) {
      this.setDelivered(update.notifications);
    }

    this.dispatch(GlobalStore.actions.hideSync());
  }

  private balances(update: WsBalanceUpdate) {
    const states: Storage.States = this.store.getState();

    try {
      this.updateBalances(states, update.balances);
    } catch (e) {
      console.log('ws update error: ' + e);
    }
  }

  private updatePrices(prices: Array<Price>) {
    console.log('set prices');
    for (let priceInfo of prices) {
      this.dispatch(
        ServerInfoStore.actions.updatePrice({
          currency: priceInfo.currency,
          price: MathUtils.roundUsd(priceInfo.value),
        }),
      );
    }
  }

  private updateBalances(states: Storage.States, balances: Record<Currency, BalanceRs>) {
    console.log('update balances');
    for (let [currencyStr, balance] of Object.entries(balances)) {
      const currency: Currency = Number(currencyStr);
      const account = states.accounts.accounts[AccountType.Main][currency];

      const api = Adaptors.get(account.network)!;

      const viewBalance = math.convertFromPlanckToViewDecimals(
        new BN(balance.transferable),
        api.decimals,
        api.viewDecimals,
      );
      this.dispatch(
        AccountsStore.actions.updateBalance({
          currency: account.currency,
          viewBalance: viewBalance,
          balance: {
            total: balance.total,
            transferable: balance.transferable,
            payableForFee: balance.payableForFee,
          },
        }),
      );

      if (new BN(balance.staking).cmp(new BN(0)) > 0 || (
        states.accounts.accounts[AccountType.Staking] !== undefined &&
        states.accounts.accounts[AccountType.Staking][account.currency] !== undefined
      )) {
        const viewStakingBalance = math.convertFromPlanckToViewDecimals(
          new BN(balance.staking),
          api.decimals,
          api.viewDecimals,
        );
        this.dispatch(
          AccountsStore.actions.updateBalanceSubAccount({
            accountType: AccountType.Staking,
            currency: account.currency,
            viewBalance: viewStakingBalance,
            balance: balance.staking,
          }),
        );
      }
    }
  }

  private updateTxs(states: Storage.States, transactions: Record<Currency, Array<WsTransaction>>) {
    console.log('update transactions');
    const txs: Array<Transaction> = [];

    const addressUsers: Array<User> = [];
    for (let currencyStr of Object.keys(transactions)) {
      const currency: Currency = Number(currencyStr);
      const api = Adaptors.get(getNetwork(currency))!;

      for (let tx of transactions[currency]) {
        if (
          states.chats.sentFromFractapp[tx.id] !== undefined ||
          (states.chats.transactions[tx.currency] !== undefined &&
            states.chats.transactions[tx.currency].transactionById['sent-' + tx.hash] !== undefined && tx.action !== TxAction.StakingWithdrawn)
        ) {
          continue;
        }
        txs.push({
          id: tx.id,
          hash: tx.hash,
          userId: tx.member,

          address: tx.memberAddress,
          currency: tx.currency,
          action: tx.action,
          txType: tx.direction,
          timestamp: tx.timestamp,
          status: tx.status,

          value: math.convertFromPlanckToViewDecimals(
            new BN(tx.value, 10),
            api.decimals,
            api.viewDecimals,
          ),
          planckValue: tx.value,
          usdValue: math.calculateUsdValue(
            new BN(tx.value, 10),
            api.decimals,
            tx.price,
          ),
          fullValue: math.convertFromPlanckToString(
            new BN(tx.value),
            api.decimals
          ),
          fee: math.convertFromPlanckToViewDecimals(
            new BN(tx.fee, 10),
            api.decimals,
            api.viewDecimals,
          ),
          planckFee: tx.fee,
          usdFee: math.calculateUsdValue(
            new BN(tx.fee, 10),
            api.decimals,
            tx.price,
          ),
        });

        if (tx.member == null) {
          addressUsers.push({
            isAddressOnly: true,
            title: tx.memberAddress,
            value: {
              address: tx.memberAddress,
              currency: tx.currency,
            },
          });
        }
      }
    }
    if (txs.length > 0) {
      this.dispatch(UsersStore.actions.setUsers(addressUsers));
      this.dispatch(ChatsStore.actions.addTxs({
        txs: txs,
        isNotify: true,
        owner: this.userId,
      }));
    }
  }

  private updateMessages(messages: Array<Message>) {
    console.log('update messages');
    //update messages
    const messagePayload: Array<{
      chatId: string,
      msg: Message,
    }> = [];
    for (let message of messages) {
      messagePayload.push({
        chatId: message.sender,
        msg: message,
      });
    }

    if (messagePayload.length > 0) {
      this.dispatch(ChatsStore.actions.addMessages(messagePayload));
    }
  }

  private updateUsers(wsUsers: Record<string, Profile>) {
    console.log('users update');
    const users: Array<User> = [];
    for (let user of Object.values(wsUsers)) {
      users.push({
        isAddressOnly: false,
        title: user.name === '' ? user.username : user.name,
        value: user,
      });
    }
    if (users.length > 0) {
      this.dispatch(UsersStore.actions.setUsers(users));
    }
  }

  public setDelivered(ids: Array<string>) {
    this.wsConnection!.send(JSON.stringify({
      method: 'set_delivered',
      ids: ids,
    }));
  }
  public getTxsStatuses(ids: Array<string>) {
    this.wsConnection!.send(JSON.stringify({
      method: 'get_txs_statuses',
      ids: ids,
    }));
  }
  public getUsers(ids: Array<string>) {
    console.log('get users: send to ws');
    this.wsConnection!.send(JSON.stringify({
      method: 'get_users',
      ids: ids,
    }));
  }
}


export default WebsocketClient;
