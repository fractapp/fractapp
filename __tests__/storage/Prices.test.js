import {Currency} from 'types/wallet';
import DB from 'storage/DB';
import Prices from 'storage/ServerInfo';

jest.mock('storage/DB', () => ({
  setPrice: jest.fn(),
}));

const initState = () => new Map();

it('Test set', async () => {
  expect(Prices.set(Currency.DOT, 1000)).toMatchSnapshot();
});
it('Test update price', async () => {
  expect(Prices.updatePrice(Currency.KSM, 250)).toMatchSnapshot();
});

it('Test reducer set', async () => {
  expect(
    Prices.reducer(initState(), Prices.set(Currency.DOT, 1000)),
  ).toMatchSnapshot();
});

it('Test reducer update balance', async () => {
  expect(
    Prices.reducer(initState(), Prices.updatePrice(Currency.KSM, 250)),
  ).toMatchSnapshot();
  expect(DB.setPrice).toBeCalledWith(Currency.KSM, 250);
});

it('Test default', async () => {
  expect(
    Prices.reducer(Prices.initialState(), {
      type: 9999,
    }),
  ).toStrictEqual(initState());
});
