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
  substrateUrls: Array<SubstrateUrl>;
  prices: Array<Price>;
};
