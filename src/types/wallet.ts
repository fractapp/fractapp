import {ImageSourcePropType} from 'react-native';
import {Network} from 'types/account';

/**
 * @category Models
 */
export enum Currency {
  DOT = 0,
  KSM,
}

/**
 * get logo for wallet
 * @category Models
 */
export function getLogo(currency: Currency) {
  let logo: ImageSourcePropType;
  switch (currency) {
    case Currency.DOT:
      logo = require('assets/img/dot.png');
      break;
    case Currency.KSM:
      logo = require('assets/img/kusama.png');
      break;
    default:
      throw new Error('invalid currency');
  }
  return logo;
}

/**
 * check logo without border
 * @category Models
 */
export function withoutBorder(currency: Currency): boolean {
  return currency === Currency.DOT || currency === Currency.KSM;
}

/**
 * get symbol for wallet
 * @category Models
 */
export function getSymbol(currency: Currency) {
  let symbol = '';
  switch (currency) {
    case Currency.DOT:
      symbol = 'DOT';
      break;
    case Currency.KSM:
      symbol = 'KSM';
      break;
    default:
      throw new Error('invalid currency');
  }
  return symbol;
}

/**
 * @category Models
 */
export class Wallet {
  name: string;
  address: string;
  balance: number;
  planks: string;
  currency: Currency;
  network: Network;
  usdValue: number;

  constructor(
    name: string,
    address: string,
    currency: Currency,
    network: Network,
    balance: number,
    planks: string,
    price: number,
  ) {
    this.name = name;
    this.address = address;
    this.balance = balance;
    this.planks = planks;
    this.currency = currency;
    this.network = network;
    this.usdValue = +(balance * price).toFixed(2);
  }
}
