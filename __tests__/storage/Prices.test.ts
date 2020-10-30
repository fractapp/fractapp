import { Currency } from 'models/wallet';
import Prices from 'storage/Prices'

it('Test updatePrice', async () => {
    expect(Prices.updatePrice(Currency.Polkadot, 1000)).toStrictEqual({
        type: Prices.Action.UPDATE_PRICE,
        price: 1000,
        currency: Currency.Polkadot
    })
});

it('Test reducer', async () => {
    expect(Prices.reducer(Prices.initialState, Prices.updatePrice(Currency.Polkadot, 1000))).toStrictEqual({
        prices: new Map([[Currency.Polkadot, 1000]])
    })
});
