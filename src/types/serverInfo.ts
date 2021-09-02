import {Currency} from 'types/wallet';
import {Network} from 'types/account';
import { TypeRegistry } from '@substrate/txwrapper-core';

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
  nonce: number;
};

export type SubstrateBase = {
  genesisHash: string;
  metadata: string;
  specVersion: number;
  transactionVersion: number;

  registry: TypeRegistry
}
