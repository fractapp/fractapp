import ServerInfoStore from 'storage/ServerInfo';
import { Currency } from 'types/wallet';

jest.mock('storage/DB', () => ({
  setServerInfo: jest.fn(),
}));

it('Test initialState', async () => {
  expect(ServerInfoStore.initialState).toMatchSnapshot();
});

it('Test set', async () => {
  const store = ServerInfoStore.initialState();
  store.isInitialized = true;

  expect(ServerInfoStore.reducer(ServerInfoStore.initialState(), ServerInfoStore.actions.set(store))).toStrictEqual(store);
});

it('Test actions', async () => {
  let store = ServerInfoStore.initialState();

  store = ServerInfoStore.reducer(store, ServerInfoStore.actions.updatePrice({
    currency: Currency.DOT,
    price: 10023,
  }));
  expect(store.prices[Currency.DOT]).toEqual(10023);
});
