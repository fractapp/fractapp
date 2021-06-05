import ChatsStore from 'storage/Chats';
import {Currency} from 'types/wallet';
import {ChatInfo, ChatType} from 'types/chatInfo';
import DB from 'storage/DB';

jest.mock('storage/DB', () => ({
  setChatsInfo: jest.fn(),
  setChat: jest.fn(),
}));

const initState = () => ({
  chats: new Map(),
  chatsInfo: new Map(),
  isInitialized: false,
});
/*it('Test set', async () => {
  const chatsInfo = new Map([
    [
      'chatId',
      {
        id: 'chatId',
        name: 'name',
        lastTxId: 'lastTxId',
        lastTxCurrency: Currency.DOT,
        notificationCount: 10,
        timestamp: new Date().getTime(),
        type: ChatType.WithUser,
        details: null,
      },
    ],
  ]);

  expect(ChatsStore.set(chatsInfo)).toStrictEqual({
    type: ChatsStore.Action.SET,
    state: chatsInfo,
  });
});

it('Test setChatInfo', async () => {//нужен ли этот тест вообще
  const chatInfo = {
    id: 'chatId',
    name: 'name',
    lastTxId: 'lastTxId',
    lastTxCurrency: Currency.DOT,
    notificationCount: 10,
    timestamp: new Date().getTime(),
    type: ChatType.WithUser,
    details: null,
  };

  expect(ChatsStore.set(chatInfo.id, chatInfo)).toStrictEqual({
    type: ChatsStore.Action.SET_CHAT_INFO, //такого экшена нет
    id: chatInfo.id,
    chatInfo: chatInfo,
  });
});

it('Test addTx', async () => {
  expect(ChatsStore.addTx('tx', 'isNotify', 'user')).toStrictEqual({
    type: ChatsStore.Action.ADD_TX,
    tx: 'tx',
    isNotify: 'isNotify',
    user: 'user',
  });
});

it('Test removeNotification', async () => {
  expect(ChatsStore.removeNotification('chatId')).toStrictEqual({
    type: ChatsStore.Action.REMOVE_NOTIFICATION,
    chatId: 'chatId',
  });
});

it('Test reducer set', async () => {
  const chatsInfo = new Map([
    [
      'chatId',
      {
        id: 'chatId',
        name: 'name',
        lastTxId: 'lastTxId',
        lastTxCurrency: Currency.DOT,
        notificationCount: 10,
        timestamp: new Date().getTime(),
        type: ChatType.WithUser,
        details: null,
      },
    ],
  ]);

  expect(
    ChatsStore.reducer(initState(), ChatsStore.set(chatsInfo)),
  ).toStrictEqual(chatsInfo);
});

it('Test reducer setChatInfo', async () => {//странные дела
  const chatInfo = {
    id: 'chatId',
    name: 'name',
    lastTxId: 'lastTxId',
    lastTxCurrency: Currency.DOT,
    notificationCount: 10,
    timestamp: new Date().getTime(),
    type: ChatType.WithUser,
    details: null,
  };

  const expectChatsInfo = new Map([
    [
      'chatId',
      {
        id: 'chatId',
        name: 'name',
        lastTxId: 'lastTxId',
        lastTxCurrency: Currency.DOT,
        notificationCount: 10,
        timestamp: new Date().getTime(),
        type: ChatType.WithUser,
        details: null,
      },
    ],
  ]);
  expect(
    ChatsStore.reducer(
      initState(),
      ChatsStore.set(chatInfo),
    ),
  ).toStrictEqual({
    chats: new Map(),
    chatsInfo: expectChatsInfo,
    isInitialized: false,
  });
  expect(DB.setChatsState).toBeCalledWith(expectChatsInfo);
});

it('Test reducer addTxInChat', async () => {//нет addTxInChat
  const chats = new Map([['chatId', new Map([['txId', Currency.DOT]])]]);
  expect(
    ChatsStore.reducer(
      initState(),
      ChatsStore.addTxInChat('chatId', 'txId', Currency.DOT),
    ),
  ).toStrictEqual({
    chatsInfo: new Map(),
    isInitialized: false,
    chats: new Map([['chatId', new Map([['txId', Currency.DOT]])]]),
  });
  expect(DB.setChat).toBeCalledWith('chatId', chats.get('chatId'));
});

it('Test reducer resetNotification', async () => {// нет setChatInfo
  const chatInfo = {
    id: 'chatId',
    name: 'name',
    lastTxId: 'lastTxId',
    lastTxCurrency: Currency.DOT,
    notificationCount: 10,
    timestamp: new Date().getTime(),
    type: ChatType.WithUser,
    details: null,
  };

  const prev = ChatsStore.reducer(
    initState(),
    ChatsStore.setChatInfo(chatInfo.id, chatInfo),
  );
  expect(
    ChatsStore.reducer(prev, ChatsStore.removeNotification('chatId')),
  ).toStrictEqual({
    chats: new Map(),
    chatsInfo: new Map([
      [
        'chatId',
        {
          id: 'chatId',
          name: 'name',
          lastTxId: 'lastTxId',
          lastTxCurrency: Currency.DOT,
          notificationCount: 0,
          timestamp: chatInfo.timestamp,
          type: ChatType.WithUser,
          details: null,
        },
      ],
    ]),
    isInitialized: false,
  });
});

it('Test default', async () => {
  expect(
    ChatsStore.reducer(ChatsStore.initialState(), {
      type: 9999,
    }),
  ).toStrictEqual(initState());
});
*/