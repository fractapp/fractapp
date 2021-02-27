import {Currency} from './wallet';

/**
 * @category Models
 */
export type Account = {
  name: string;
  address: string;
  pubKey: string;
  currency: Currency;
  balance: number;
  planks: string;
};
