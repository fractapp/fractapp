import {Currency} from 'types/wallet';
import DB from 'storage/DB';
import Transactions from 'storage/Transactions';
import {TxStatus, TxType} from 'types/transaction';
import {UserProfile} from 'types/profile';
import GlobalStore from 'storage/Global';

jest.mock('storage/DB', () => ({
  setPendingTxs: jest.fn(),
  setTx: jest.fn(),
}));

const initState = () => ({
  isUpdatingProfile: false,
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
  contacts: [],
  users: new Map(),
  notificationCount: 0,
  authInfo: {
    isSynced: false,
    isAuthed: false,
    isPasscode: false,
    isBiometry: false,
  },
  isInitialized: false,
  isRegistered: false,
  isLoadingShow: false,
});

it('Test set', async () => {});
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
it('Test addNotificationCount', async () => {
  expect(GlobalStore.addNotificationCount()).toMatchSnapshot();
});
it('Test removeNotificationCount', async () => {
  expect(GlobalStore.removeNotificationCount(10)).toMatchSnapshot();
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
it('Test deleteUser', async () => {
  expect(GlobalStore.deleteUser('id')).toMatchSnapshot();
});

it('Test default', async () => {
  expect(
    GlobalStore.reducer(GlobalStore.initialState, {
      type: 9999,
    }),
  ).toStrictEqual(initState());
});
