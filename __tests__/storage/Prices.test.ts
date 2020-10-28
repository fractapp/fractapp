import { Currency } from 'models/wallet';
import { updatePrice, Action, reducer, initialState } from 'storage/Prices'

it('Test updatePrice', async () => {
    expect(updatePrice(Currency.Polkadot, 1000)).toStrictEqual({
        type: Action.UPDATE_PRICE,
        price: 1000,
        currency: Currency.Polkadot
    })
});

it('Test reducer', async () => {
    expect(reducer(initialState, updatePrice(Currency.Polkadot, 1000))).toStrictEqual({
        prices: new Map([[Currency.Polkadot, 1000]])
    })
});
