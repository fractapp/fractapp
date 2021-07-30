import {Currency} from 'types/wallet';
import { Network } from 'types/account';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import DB from 'storage/DB';

/**
 * @namespace
 * @category Storage
 */
namespace ServerInfoStore {
  export type State = {
    prices: {
      [id in Currency]: number
    },
    urls: {
      [id in Network]: string
    },
    isInitialized: boolean
  }
  export const initialState = (): State => <State>({
    prices: {},
    urls: {},
    isInitialized: false,
  });

  const slice = createSlice({
    name: 'serverInfo',
    initialState: initialState(),
    reducers: {
      set(state: State, action: PayloadAction<State>): State {
        return action.payload;
      },
      updatePrice(state: State, action: PayloadAction<{
        currency: Currency,
        price: number
      }>): State {
        state.prices[action.payload.currency] = action.payload.price;
        DB.setServerInfo(state);
        return state;
      },
      setUrl(state: State, action: PayloadAction<{
        network: Network,
        url: string
      }>): State {
        state.urls[action.payload.network] = action.payload.url;
        DB.setServerInfo(state);
        return state;
      },
    },
  });

  export const actions = slice.actions;
  export const reducer = slice.reducer;
}
export default ServerInfoStore;
