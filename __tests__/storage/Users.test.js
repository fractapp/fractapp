import { Currency } from 'types/wallet';
import UsersStore from 'storage/Users';
import DB from 'storage/DB';
import { AddressOnly, Profile } from 'types/profile';

jest.mock('storage/DB', () => ({
  setContacts: jest.fn(),
  setUsers: jest.fn(),
}));

it('Test initialState', async () => {
  expect(UsersStore.initialState).toMatchSnapshot();
});

it('Test set', async () => {
  const store = UsersStore.initialState();
  store.isInitialized = true;

  expect(UsersStore.reducer(UsersStore.initialState(), UsersStore.actions.set(store))).toStrictEqual(store);
});

it('Test actions', async () => {
  let store = UsersStore.initialState();

  const contacts = ['a', 'b', 'c'];
  store = UsersStore.reducer(store, UsersStore.actions.setContacts(contacts));
  expect(store.contacts).toEqual(contacts);
  expect(DB.setContacts).toBeCalledWith(contacts);

  const users = [
    {
      isAddressOnly: true,
      title: 'address',
      value: {
        address: 'address',
        currency: Currency.DOT,
      },
    },
    {
      isAddressOnly: false,
      title: 'userOne',
      value: {
        id: 'user',
        name: 'userName',
        username: 'username#1',
        avatarExt: 'png',
        lastUpdate: 1000,
        addresses: {
          0: 'address#1',
          1: 'address#2',
        },
        isChatBot: false,
      },
    },
  ];

  store = UsersStore.reducer(store, UsersStore.actions.setUsers(users));
  expect(store.users).toStrictEqual({
    'address': users[0],
    'user': users[1],
  });
  expect(DB.setUsers).toBeCalled();
});
