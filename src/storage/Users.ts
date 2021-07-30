import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AddressOnly, Profile, User } from 'types/profile';
import DB from 'storage/DB';

/**
 * @namespace
 * @category Storage
 */
namespace UsersStore {
  export type State = {
    contacts: Array<string>;
    users: {
      [id in string]: User
    },
    isInitialized: boolean,
  };

  export const initialState = (): State => ({
    contacts: [],
    users: {},
    isInitialized: false,
  });

  const slice = createSlice({
    name: 'users',
    initialState: initialState(),
    reducers: {
      set(state: State, action: PayloadAction<State>): State {
        state = action.payload;
        return state;
      },
      setContacts(state: State, action: PayloadAction<Array<string>>): State {
        state.contacts = action.payload;
        DB.setContacts(state.contacts);
        return state;
      },
      setUser(state: State, action: PayloadAction<User>): State {
        let id = '';
        const u: User = action.payload;
        if (u.isAddressOnly) {
          id = (u.value as AddressOnly).address;
        } else {
          id = (u.value as Profile).id;
        }

        state.users[id] = u;
        DB.setUsers(state.users);
        return state;
      },
    },
  });

  export const actions = slice.actions;
  export const reducer = slice.reducer;
}
export default UsersStore;
