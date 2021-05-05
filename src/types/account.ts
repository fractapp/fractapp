import {Currency} from './wallet';

export enum Network {
  Polkadot = 0,
  Kusama,
}

/**
 * @category Models
 */
export type Account = {
  name: string;
  address: string;
  pubKey: string;
  currency: Currency;
  network: Network;
  balance: number;
  planks: string;
};
