import {Currency} from './wallet';

/**
 * @category Models
 */
export enum AccountType {
  Main,
  Staking
}

/**
 * @category Models
 */
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
  viewBalance: number;
  balance: AccountBalance;
  type: AccountType
};

/**
 * @category Models
 */
export type BalanceRs = {
  total: string,
  transferable: string,
  payableForFee: string,
  staking: string
}

/**
 * @category Models
 */
export type AccountBalance = {
  total: string,
  transferable: string,
  payableForFee: string
}
