import {Currency} from './wallet';

/**
 * @category Models
 */
export class Account {
  name: string;
  address: string;
  pubKey: string;
  currency: Currency;
  balance: number;
  planks: string;

  constructor(
    name: string,
    address: string,
    pubKey: string,
    currency: Currency,
    balance: number,
    planks: string,
  ) {
    this.name = name;
    this.address = address;
    this.pubKey = pubKey;
    this.currency = currency;
    this.balance = balance;
    this.planks = planks;
  }
}
