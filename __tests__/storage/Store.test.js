import Store from 'storage/Store';

jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

jest.mock('storage/DB', () => ({
  setProfile: jest.fn(),
  setAuthInfo: jest.fn(),
  setJWT: jest.fn(),
  enablePasscode: jest.fn(),
  disablePasscode: jest.fn(),
}));

it('Test initialState', async () => {
  expect(Store.initStore()).toMatchSnapshot();
  expect(Store.initValues()).toMatchSnapshot();
});
