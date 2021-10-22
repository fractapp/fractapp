import GlobalStore from 'storage/Global';
import DB from 'storage/DB';

jest.mock('storage/DB', () => ({
  setProfile: jest.fn(),
  setAuthInfo: jest.fn(),
  setJWT: jest.fn(),
  enablePasscode: jest.fn(),
  disablePasscode: jest.fn(),
}));

it('Test initialState', async () => {
  expect(GlobalStore.initialState).toMatchSnapshot();
});

it('Test set', async () => {
  const store = GlobalStore.initialState();
  store.authInfo.hasBiometry = true;

  expect(GlobalStore.reducer(GlobalStore.initialState(), GlobalStore.actions.set(store))).toStrictEqual(store);
});

it('Test actions', async () => {
  let store = GlobalStore.initialState();

  store = GlobalStore.reducer(store, GlobalStore.actions.setAllStatesLoaded(true));
  expect(store.loadInfo.isAllStatesLoaded).toEqual(true);

  store = GlobalStore.reducer(store, GlobalStore.actions.initWallet());
  expect(store.authInfo.hasWallet).toEqual(true);
  expect(DB.setAuthInfo).toBeCalled();

  store = GlobalStore.reducer(store, GlobalStore.actions.signInFractapp());
  expect(store.isRegisteredInFractapp).toEqual(true);
  expect(store.isUpdatingProfile).toEqual(true);

  const profile = {
    id: 'myProfile',
    name: 'name',
    username: 'username',
    phoneNumber: 'phoneNumber',
    email: 'email',
    avatarExt: 'png',
    lastUpdate: 100,
  };
  store = GlobalStore.reducer(store, GlobalStore.actions.setProfile(profile));
  expect(store.profile).toEqual(profile);
  expect(DB.setProfile).toBeCalledWith(profile);

  store = GlobalStore.reducer(store, GlobalStore.actions.setUpdatingProfile(false));
  expect(store.isUpdatingProfile).toEqual(false);

  store = GlobalStore.reducer(store, GlobalStore.actions.signOutFractapp());
  expect(store.profile).toEqual({
    id: '',
    name: '',
    username: '',
    phoneNumber: '',
    email: '',
    avatarExt: '',
    lastUpdate: 0,
  });
  expect(store.isRegisteredInFractapp).toEqual(false);
  expect(DB.setProfile).toBeCalledWith(null);
  expect(DB.setJWT).toBeCalledWith(null);

  store = GlobalStore.reducer(store, GlobalStore.actions.setSynced());
  expect(store.authInfo.isFirstSync).toEqual(true);

  store = GlobalStore.reducer(store, GlobalStore.actions.enablePasscode('123123'));
  expect(store.authInfo.hasPasscode).toEqual(true);
  expect(store.authInfo.hasBiometry).toEqual(false);
  expect(DB.enablePasscode).toBeCalledWith('123123');

  store = GlobalStore.reducer(store, GlobalStore.actions.enableBiometry());
  expect(store.authInfo.hasBiometry).toEqual(true);

  store = GlobalStore.reducer(store, GlobalStore.actions.disableBiometry());
  expect(store.authInfo.hasBiometry).toEqual(false);

  store = GlobalStore.reducer(store, GlobalStore.actions.disablePasscode());
  expect(store.authInfo.hasPasscode).toEqual(false);
  expect(store.authInfo.hasBiometry).toEqual(false);
  expect(DB.disablePasscode).toBeCalled();

  store = GlobalStore.reducer(store, GlobalStore.actions.showLoading());
  expect(store.loadInfo.isLoadingShow).toEqual(true);

  store = GlobalStore.reducer(store, GlobalStore.actions.hideLoading());
  expect(store.loadInfo.isLoadingShow).toEqual(false);

  store = GlobalStore.reducer(store, GlobalStore.actions.showSync());
  expect(store.loadInfo.isSyncShow).toEqual(true);

  store = GlobalStore.reducer(store, GlobalStore.actions.hideSync());
  expect(store.loadInfo.isSyncShow).toEqual(false);
});
