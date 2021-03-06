import {ImageSourcePropType} from 'react-native';

/**
 * @category Models
 */
export enum Currency {
  Polkadot = 0,
  Kusama,
}

/**
 * get logo for wallet
 * @category Models
 */
export function getLogo(currency: Currency) {
  let logo: ImageSourcePropType;
  switch (currency) {
    case Currency.Polkadot:
      logo = require('assets/img/dot.png');
      break;
    case Currency.Kusama:
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
  return currency === Currency.Polkadot || currency === Currency.Kusama;
}

/**
 * get symbol for wallet
 * @category Models
 */
export function getSymbol(currency: Currency) {
  let symbol = '';
  switch (currency) {
    case Currency.Polkadot:
      symbol = 'DOT';
      break;
    case Currency.Kusama:
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
  usdValue: number;

  constructor(
    name: string,
    address: string,
    currency: Currency,
    balance: number,
    planks: string,
    price: number,
  ) {
    this.name = name;
    this.address = address;
    this.balance = balance;
    this.planks = planks;
    this.currency = currency;

    this.usdValue = +(balance * price).toFixed(2);
  }
}
