import {Currency} from 'types/wallet';
import {Network} from 'types/account';

export type SubstrateUrl = {
  network: Network;
  url: string;
};
export type Price = {
  currency: Currency;
  value: number;
};

export type ServerInfo = {
  prices: Array<Price>;
};

export type FeeInfo = {
  fee: string;
};

export type SubstrateTxBase = {
  blockNumber: string;
  blockHash: string;
  genesisHash: string;
  metadata: string;

  specVersion: number;
  transactionVersion: number;

  nonce: number;
};
