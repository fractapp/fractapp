import { Currency } from "./wallet";

/**
 * @category Models
 */
export class Account {
    name: string;
    address: string;
    pubKey: string;
    currency: Currency;
    balance: number;

    constructor(name: string, address: string, pubKey: string, currency: Currency, balance: number) {
        this.name = name
        this.address = address
        this.pubKey = pubKey
        this.currency = currency
        this.balance = balance
    }

    static parse(json: string): Account {
        return JSON.parse(json)
    }
}