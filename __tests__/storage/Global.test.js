import GlobalStore from 'storage/Global';
import DB from 'storage/DB';

jest.mock('storage/DB', () => ({
  setProfile: jest.fn(),
  setAuthInfo: jest.fn(),
  setNotificationCount: jest.fn(),
  enablePasscode: jest.fn(),
  disablePasscode: jest.fn(),
  setContacts: jest.fn(),
  setUsers: jest.fn(),
  setUrls: jest.fn(),
}));

const initState = () => ({
  profile: {
    id: '',
    name: '',
    username: '',
    phoneNumber: '',
    email: '',
    isMigratory: false,
    avatarExt: '',
    lastUpdate: 0,
  },
  authInfo: {
    isSynced: false,
    isAuthed: false,
    isPasscode: false,
    isBiometry: false,
  },

  lang: null,
  users: new Map(),
  urls: new Map(),
  contacts: [],

  isUpdatingProfile: false,
  isInitialized: false,
  isRegistered: false,
  isLoadingShow: false,
  isSyncShow: true,
});

it('Test set', async () => {
  expect(
    GlobalStore.set(
      {
        id: 'id',
        name: 'name',
        username: 'username',
        phoneNumber: '+123123123',
        email: 'email@email.com',
        isMigratory: false,
        avatarExt: 'png',
        lastUpdate: 123123,
      },
      10,
      {
        isSynced: false,
        isAuthed: true,
        isPasscode: false,
        isBiometry: true,
      },
      true,
      false,
      [
        {
          id: 'idOne',
          name: 'nameOne',
          username: 'usernameOne',
          avatarExt: 'jpg',
          lastUpdate: 123123,
          addresses: {
            0: 'addressOne',
            1: 'addressTwo',
          },
        },
        {
          id: 'idOne',
          name: 'nameOne',
          username: 'usernameOne',
          avatarExt: 'jpg',
          lastUpdate: 123123,
          addresses: {
            0: 'addressOne',
            1: 'addressTwo',
          },
        },
      ],
      new Map([
        [
          'idOne',
          {
            id: 'idOne',
            name: 'nameOne',
            username: 'usernameOne',
            avatarExt: 'jpg',
            lastUpdate: 123123,
            addresses: {
              0: 'addressOne',
              1: 'addressTwo',
            },
          },
        ],
      ]),
    ),
  ).toMatchSnapshot();
});
it('Test setProfile', async () => {
  expect(
    GlobalStore.setProfile({
      id: 'id',
      name: 'name',
      username: 'username',
      phoneNumber: '+123123123',
      email: 'email@email.com',
      isMigratory: false,
      avatarExt: 'png',
      lastUpdate: 123123,
    }),
  ).toMatchSnapshot();
});
it('Test setUpdatingProfile', async () => {
  expect(GlobalStore.setUpdatingProfile(true)).toMatchSnapshot();
});
it('Test signInLocal', async () => {
  expect(GlobalStore.signInLocal()).toMatchSnapshot();
});
it('Test signInFractapp', async () => {
  expect(GlobalStore.signInFractapp()).toMatchSnapshot();
});
it('Test signOutFractapp', async () => {
  expect(GlobalStore.signOutFractapp()).toMatchSnapshot();
});
it('Test setSynced', async () => {
  expect(GlobalStore.setSynced()).toMatchSnapshot();
});

it('Test enablePasscode', async () => {
  expect(GlobalStore.enablePasscode('111111')).toMatchSnapshot();
});
it('Test disablePasscode', async () => {
  expect(GlobalStore.disablePasscode()).toMatchSnapshot();
});
it('Test enableBiometry', async () => {
  expect(GlobalStore.enableBiometry()).toMatchSnapshot();
});
it('Test disableBiometry', async () => {
  expect(GlobalStore.disableBiometry()).toMatchSnapshot();
});
it('Test setLoading', async () => {
  expect(GlobalStore.setLoading(true)).toMatchSnapshot();
});
it('Test setContacts', async () => {
  expect(GlobalStore.setContacts(['contact#1', 'contact#2'])).toMatchSnapshot();
});
it('Test setUser', async () => {
  expect(
    GlobalStore.setUser({
      id: 'id',
      name: 'name',
      username: 'username',
      avatarExt: 'jpg',
      lastUpdate: 123123,
      addresses: {
        0: 'addressOne',
        1: 'addressTwo',
      },
    }),
  ).toMatchSnapshot();
});
it('Test deleteUser', async () => {
  expect(GlobalStore.deleteUser('id')).toMatchSnapshot();
});

it('Test reducer set', async () => {
  expect(
    GlobalStore.reducer(
      initState(),
      GlobalStore.set(
        {
          id: 'id',
          name: 'name',
          username: 'username',
          phoneNumber: '+123123123',
          email: 'email@email.com',
          isMigratory: false,
          avatarExt: 'png',
          lastUpdate: 123123,
        },
        10,
        {
          isSynced: false,
          isAuthed: true,
          isPasscode: false,
          isBiometry: true,
        },
        true,
        false,
        [
          {
            id: 'idOne',
            name: 'nameOne',
            username: 'usernameOne',
            avatarExt: 'jpg',
            lastUpdate: 123123,
            addresses: {
              0: 'addressOne',
              1: 'addressTwo',
            },
          },
          {
            id: 'idOne',
            name: 'nameOne',
            username: 'usernameOne',
            avatarExt: 'jpg',
            lastUpdate: 123123,
            addresses: {
              0: 'addressOne',
              1: 'addressTwo',
            },
          },
        ],
        new Map([
          [
            'idOne',
            {
              id: 'idOne',
              name: 'nameOne',
              username: 'usernameOne',
              avatarExt: 'jpg',
              lastUpdate: 123123,
              addresses: {
                0: 'addressOne',
                1: 'addressTwo',
              },
            },
          ],
        ]),
      ),
    ),
  ).toMatchSnapshot();
});
it('Test reducer setProfile', async () => {
  const p = {
    id: 'id',
    name: 'name',
    username: 'username',
    phoneNumber: '+123123123',
    email: 'email@email.com',
    isMigratory: false,
    avatarExt: 'png',
    lastUpdate: 123123,
  };

  expect(
    GlobalStore.reducer(initState(), GlobalStore.setProfile(p)),
  ).toMatchSnapshot();
  expect(DB.setProfile).toBeCalledWith(p);
});
it('Test reducer setUpdatingProfile', async () => {
  expect(
    GlobalStore.reducer(initState(), GlobalStore.setUpdatingProfile(true)),
  ).toMatchSnapshot();
});
it('Test reducer signInLocal', async () => {
  expect(
    GlobalStore.reducer(initState(), GlobalStore.signInLocal()),
  ).toMatchSnapshot();
  expect(DB.setAuthInfo).toBeCalledWith({
    isSynced: false,
    isAuthed: true,
    isPasscode: false,
    isBiometry: false,
  });
});
it('Test reducer signInFractapp', async () => {
  expect(
    GlobalStore.reducer(initState(), GlobalStore.signInFractapp()),
  ).toMatchSnapshot();
});
it('Test reducer signOutFractapp', async () => {
  expect(
    GlobalStore.reducer(initState(), GlobalStore.signOutFractapp()),
  ).toMatchSnapshot();
});
it('Test reducer setSynced', async () => {
  expect(
    GlobalStore.reducer(initState(), GlobalStore.setSynced()),
  ).toMatchSnapshot();
  expect(DB.setAuthInfo).toBeCalledWith({
    isSynced: true,
    isAuthed: false,
    isPasscode: false,
    isBiometry: false,
  });
});

it('Test reducer enablePasscode', async () => {
  expect(
    GlobalStore.reducer(initState(), GlobalStore.enablePasscode('111111')),
  ).toMatchSnapshot();
  expect(DB.enablePasscode).toBeCalledWith('111111', false);
});
it('Test reducer disablePasscode', async () => {
  expect(
    GlobalStore.reducer(initState(), GlobalStore.disablePasscode()),
  ).toMatchSnapshot();

  expect(DB.disablePasscode).toBeCalled();
});
it('Test reducer enableBiometry', async () => {
  expect(
    GlobalStore.reducer(initState(), GlobalStore.enableBiometry()),
  ).toMatchSnapshot();
});
it('Test reducer disableBiometry', async () => {
  expect(
    GlobalStore.reducer(initState(), GlobalStore.disableBiometry()),
  ).toMatchSnapshot();
});
it('Test reducer setLoading', async () => {
  expect(
    GlobalStore.reducer(initState(), GlobalStore.setLoading(true)),
  ).toMatchSnapshot();
});
it('Test reducer setContacts', async () => {
  const c = ['contact#1', 'contact#2'];
  expect(
    GlobalStore.reducer(initState(), GlobalStore.setContacts(c)),
  ).toMatchSnapshot();

  expect(DB.setContacts).toBeCalledWith(c);
});
it('Test reducer setUser', async () => {
  const u = {
    id: 'id',
    name: 'name',
    username: 'username',
    avatarExt: 'jpg',
    lastUpdate: 123123,
    addresses: {
      0: 'addressOne',
      1: 'addressTwo',
    },
  };
  expect(
    GlobalStore.reducer(initState(), GlobalStore.setUser(u)),
  ).toMatchSnapshot();
  expect(DB.setUsers).toBeCalledWith(new Map([[u.id, u]]));
});
it('Test reducer deleteUser', async () => {
  let state = initState();
  const uOne = {
    id: 'idOne',
    name: 'nameOne',
    username: 'usernameOne',
    avatarExt: 'jpg',
    lastUpdate: 123123,
    addresses: {
      0: 'addressOne',
      1: 'addressTwo',
    },
  };
  const uTwo = {
    id: 'idTwo',
    name: 'nameTwo',
    username: 'username',
    avatarExt: 'jpg',
    lastUpdate: 123123,
    addresses: {
      0: 'addressOne',
      1: 'addressTwo',
    },
  };
  state = GlobalStore.reducer(state, GlobalStore.setUser(uOne));
  expect(state).toMatchSnapshot();

  expect(DB.setUsers).toBeCalledWith(new Map([[uOne.id, uOne]]));

  state = GlobalStore.reducer(state, GlobalStore.setUser(uTwo));
  expect(state).toMatchSnapshot();

  expect(DB.setUsers).toBeCalledWith(
    new Map([
      [uOne.id, uOne],
      [uTwo.id, uTwo],
    ]),
  );

  expect(
    GlobalStore.reducer(state, GlobalStore.deleteUser('idOne')),
  ).toMatchSnapshot();

  expect(DB.setUsers).toBeCalledWith(new Map([[uTwo.id, uTwo]]));
});

it('Test default', async () => {
  expect(
    GlobalStore.reducer(GlobalStore.initialState(), {
      type: 9999,
    }),
  ).toStrictEqual(initState());
});
