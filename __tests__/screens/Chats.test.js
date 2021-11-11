import React from 'react';
import renderer from 'react-test-renderer';
import {Chats} from 'screens/Chats';
import {Currency} from 'types/wallet';
import Store from 'storage/Store';
import { useDispatch, useSelector } from 'react-redux';

jest.mock('storage/DB', () => {});
jest.mock('adaptors/adaptor', () => {});
jest.mock('utils/fractappClient', () => ({
  getImgUrl: jest.fn(),
}));
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

const dispatch = jest.fn();
useDispatch.mockReturnValue(dispatch);

it('Test chats', () => {
  let store = Store.initValues();

  for (let i = 0; i < 5; i++) {
    const chatId = 'chatId' + i;
    store.chats.chatsInfo[chatId] = {
      id: chatId,
      notificationCount: i,
      lastMsgId: 'first',
    };
    store.chats.chats[chatId] = {
      messages: {
        'first': {
          id: 'first',
          value: 'hello',
          action: null,
          args: {},
          rows: [],
          timestamp: 1000,
          sender: 'sender',
          receiver: 'receiver',
          hideBtn: false,
        },
      },
      infoById: {},
    };
    if (i !== 0) {
      store.users.users[chatId] = {
        isAddressOnly: true,
        title: 'address#' + i,
        value: {
          address: 'address#1' + i,
          currency: Currency.DOT,
        },
      };
    }
  }
  store.global.profile =  {
    id: 'myProfile',
    name: 'name',
    username: 'username',
    phoneNumber: 'phoneNumber',
    email: 'email',
    avatarExt: 'png',
    lastUpdate: 100,
  };

  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  const tree = renderer
    .create(
      <Chats
        navigation={{
          setOptions: jest.fn(),
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
