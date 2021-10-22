import DB from 'storage/DB';
import ChatsStore, { State, TxId } from 'storage/Chats';
import { Transaction, TxAction, TxStatus, TxType } from 'types/transaction';
import { Currency, getSymbol } from 'types/wallet';
import StringUtils from 'utils/string';
import { getTxName } from 'types/inputs';

jest.mock('storage/DB', () => ({
  setContacts: jest.fn(),
  setUsers: jest.fn(),
  setChatsState: jest.fn(),
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

it('Test initialState', async () => {
  expect(ChatsStore.initialState).toMatchSnapshot();
});

it('Test set', async () => {
  const store = ChatsStore.initialState();
  store.isInitialized = true;

  expect(ChatsStore.reducer(ChatsStore.initialState(), ChatsStore.actions.set(store))).toStrictEqual(store);
});

it('Test addEmptyChat', async () => {
  let store = ChatsStore.initialState();
  const chatId = 'chatId';
  store = ChatsStore.reducer(store, ChatsStore.actions.addEmptyChat({
    chatId: chatId,
  }));

  expect(store.chats[chatId]).toStrictEqual({
    infoById: {},
    messages: {},
  });
  expect(store.chatsInfo[chatId]).toStrictEqual({
    id: chatId,
    notificationCount: 0,
    lastMsgId: null,
  });

  expect(DB.setChatsState).toBeCalled();
});

it('Test hideBtns', async () => {
  let store = ChatsStore.initialState();
  const chatId = 'chatId';
  const msgId = 'msgId';

  store.chats[chatId] = {
    messages: {
      msgId: {
        hideBtn: false,
      },
    },
  };
  store = ChatsStore.reducer(store, ChatsStore.actions.hideBtns({
    chatId: chatId,
    msgId: msgId,
  }));

  expect(store.chats[chatId].messages[msgId].hideBtn).toEqual(true);

  expect(DB.setChatsState).toBeCalled();
});

it('Test add pending tx', async () => {
  const owner = 'owner';
  const tx = {
    id: '2',
    userId: 'userId',
    hash: 'hash1',

    address: 'address#1',
    currency: Currency.DOT,
    action: TxAction.Transfer,
    txType: TxType.Sent,
    timestamp: new Date('12-12-2020').getTime(),

    value: 10,
    planckValue: '10000000',
    usdValue: 20,
    fullValue: '2000000',

    fee: 3000,
    planckFee: '300000',
    usdFee: 4000,

    status: TxStatus.Success,
  };
  let store = ChatsStore.initialState();
  store = ChatsStore.reducer(store, ChatsStore.actions.addPendingTx({
    tx: tx,
    owner: owner,
  }));

  expect(store.pendingTransactions[tx.currency].idsOfTransactions).toEqual([ tx.id ]);
  expect(store.transactions[tx.currency].transactionById[tx.id]).toStrictEqual(tx);

  store = ChatsStore.reducer(store, ChatsStore.actions.confirmPendingTx({
    txId: tx.id,
    currency: tx.currency,
    status: TxStatus.Success,
    index: 0,
  }));

  expect(store.pendingTransactions[tx.currency].idsOfTransactions).toEqual([]);
  expect(store.transactions[tx.currency].transactionById[tx.id].status).toStrictEqual(TxStatus.Success);

  expect(DB.setChatsState).toBeCalled();
});

it('Test addMessage/removeNotification/removeChat', async () => {
  const chatId = 'chatID';
  let store = ChatsStore.initialState();
  const msgs = [
    {
      chatId: chatId,
      msg: {
        id: 'id1',
        value: 'value',
        action: null,
        args: {},
        rows: [],
        timestamp: 1000,
        sender: 'sender',
        receiver: 'receiver',
        hideBtn: false,
      },
    },
    {
      chatId: chatId,
      msg: {
        id: 'id2',
        value: 'value',
        action: null,
        args: {},
        rows: [],
        timestamp: 2000,
        sender: 'sender',
        receiver: 'receiver',
        hideBtn: false,
      },
    },
  ];
  store = ChatsStore.reducer(store, ChatsStore.actions.addMessages(msgs));

  expect(store.chatsInfo[chatId]).toEqual({
    id: chatId,
    notificationCount: 2,
    lastMsgId: 'id2',
  });
  expect(store.chats[chatId].messages[msgs[0].msg.id]).toStrictEqual(msgs[0].msg);
  expect(store.chats[chatId].messages[msgs[1].msg.id]).toStrictEqual(msgs[1].msg);

  store = ChatsStore.reducer(store, ChatsStore.actions.addMessages(msgs));
  expect(Object.keys(store.chats[chatId].messages).length).toEqual(2);

  store = ChatsStore.reducer(store, ChatsStore.actions.removeNotification(chatId));
  expect(store.totalNotifications).toEqual(0);
  expect(store.chatsInfo[chatId].notificationCount).toEqual(0);

  store = ChatsStore.reducer(store, ChatsStore.actions.removeChat(chatId));
  expect(store.totalNotifications).toEqual(0);
  expect(store.chatsInfo[chatId]).toStrictEqual({
    id: chatId,
    notificationCount: 0,
    lastMsgId: null,
  });
  expect(store.chats[chatId]).toStrictEqual( { infoById: {}, messages: {} });

  expect(DB.setChatsState).toBeCalled();
});

it('Test add tx', async () => {
  for (let i = 0; i < 10; i++) {
    let action = TxAction.Transfer;
    let txType;

    if (i === 0) {
      action = TxAction.StakingReward;
      txType = TxType.Received;
    } else if (i === 3) {
      txType = TxType.None;
    } else if (i === 4) {
      action = TxAction.UpdateNomination;
      txType = TxType.Sent;
    } else if (i % 2 === 0) {
      txType = TxType.Sent;
    } else if (i % 2 !== 0) {
      txType = TxType.Received;
    }

    const tx = {
      id: 'id' + i,
      userId: 'userId',
      hash: 'hash1',

      address: 'address#1',
      currency: Currency.DOT,
      action: action,
      txType: txType,
      timestamp: new Date('12-12-2020').getTime(),

      value: 10,
      planckValue: '10000000',
      usdValue: 20,
      fullValue: '2000000',

      fee: 3000,
      planckFee: '300000',
      usdFee: 4000,

      status: TxStatus.Success,
    };
    let store = ChatsStore.initialState();
    store = ChatsStore.reducer(store, ChatsStore.actions.addTx({
      tx: tx,
      owner: 'owner',
      isNotify: true,
    }));
    expect(store.transactions[tx.currency].transactionById[tx.id]).toStrictEqual(tx);

    if (action === TxAction.StakingReward) {
      expect(store.chats[tx.userId]).toEqual(undefined);
    } else {
      expect(store.totalNotifications).toEqual(1);
      expect(store.chatsInfo[tx.userId].notificationCount).toEqual(1);

      let amount = (tx.usdValue !== 0
        ? ` $${tx.usdValue}`
        : ` ${tx.value} ${getSymbol(tx.currency)}`);

      let msg = '';
      if (tx.action === TxAction.Transfer) {
        switch (tx.txType) {
          case TxType.Sent:
            msg = StringUtils.texts.YouSentTitle + amount;
            break;
          case TxType.Received:
            msg = StringUtils.texts.YouReceivedTitle + amount;
            break;
          case TxType.None:
            msg = 'Transaction';
            break;
        }
      } else {
        msg = getTxName(tx.action);
      }
      expect(store.chats[tx.userId].messages[tx.id].value).toEqual(msg);
    }

    expect(DB.setChatsState).toBeCalled();
  }
});
