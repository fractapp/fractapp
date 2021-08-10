import {ImageSourcePropType} from 'react-native';

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

export function getName(currency: Currency) {
  let name = '';
  switch (currency) {
    case Currency.DOT:
      name = 'Polkadot';
      break;
    case Currency.KSM:
      name = 'Kusama';
      break;
    default:
      throw new Error('invalid currency');
  }
  return name;
}

export function getColor(currency: Currency) {
  let color = '';
  switch (currency) {
    case Currency.DOT:
      color = '#E6007A';
      break;
    case Currency.KSM:
      color = '#434C74';
      break;
    default:
      throw new Error('invalid currency');
  }
  return color;
}

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
 * string to currency
 * @category Models
 */
export function toCurrency(currency: string): Currency {
  switch (currency) {
    case 'DOT':
      return Currency.DOT;
    case 'KSM':
      return Currency.KSM;
    default:
      throw new Error('invalid currency');
  }
}


/**
 * currency to string
 * @category Models
 */
export function fromCurrency(currency: Currency): string {
  switch (currency) {
    case Currency.DOT:
      return 'DOT';
    case Currency.KSM:
      return 'KSM';
    default:
      throw new Error('invalid currency');
  }
}

/*
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
    this.usdValue = math.roundUsd(balance * price);
  }
}
*/
