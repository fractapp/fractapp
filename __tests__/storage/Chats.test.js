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
it('Test set', async () => {
  const chats = new Map([['chatId', new Map([['txId', Currency.DOT]])]]);
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

  expect(ChatsStore.set(chats, chatsInfo)).toStrictEqual({
    type: ChatsStore.Action.SET,
    chats: chats,
    chatsInfo: chatsInfo,
  });
});

it('Test setChatInfo', async () => {
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

  expect(ChatsStore.setChatInfo(chatInfo.id, chatInfo)).toStrictEqual({
    type: ChatsStore.Action.SET_CHAT_INFO,
    id: chatInfo.id,
    chatInfo: chatInfo,
  });
});

it('Test addTxInChat', async () => {
  expect(ChatsStore.addTxInChat('chatId', 'txId', Currency.DOT)).toStrictEqual({
    type: ChatsStore.Action.ADD_TX_IN_CHAT,
    chatId: 'chatId',
    txId: 'txId',
    currency: Currency.DOT,
  });
});

it('Test resetNotification', async () => {
  expect(ChatsStore.resetNotification('chatId')).toStrictEqual({
    type: ChatsStore.Action.RESET_NOTIFICATION,
    chatId: 'chatId',
  });
});

it('Test reducer set', async () => {
  const chats = new Map([['chatId', new Map([['txId', Currency.DOT]])]]);
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
    ChatsStore.reducer(initState(), ChatsStore.set(chats, chatsInfo)),
  ).toStrictEqual({
    chats: chats,
    chatsInfo: chatsInfo,
    isInitialized: true,
  });
});

it('Test reducer setChatInfo', async () => {
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
      ChatsStore.setChatInfo(chatInfo.id, chatInfo),
    ),
  ).toStrictEqual({
    chats: new Map(),
    chatsInfo: expectChatsInfo,
    isInitialized: false,
  });
  expect(DB.setChatsInfo).toBeCalledWith(expectChatsInfo);
});

it('Test reducer addTxInChat', async () => {
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

it('Test reducer resetNotification', async () => {
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
    ChatsStore.reducer(prev, ChatsStore.resetNotification('chatId')),
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
