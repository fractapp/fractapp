import { ImageSourcePropType } from "react-native";

export enum Currency {
    Polkadot = 0,
    Kusama
}

export function getLogo(currency: Currency) {
    let logo: ImageSourcePropType
    switch (currency) {
        case Currency.Polkadot:
            logo = require("assets/img/dot.png")
            break
        case Currency.Kusama:
            logo = require("assets/img/kusama.png")
            break
        default:
            throw ("invalid currency")
    }
    return logo
}
export function getSymbol(currency: Currency) {
    let symbol = ""
    switch (currency) {
        case Currency.Polkadot:
            symbol = "DOT"
            break
        case Currency.Kusama:
            symbol = "KSM"
            break
        default:
            throw ("invalid currency")
    }
    return symbol
}

export class Wallet {
    name: string;
    address: string;
    balance: number;
    currency: Currency;
    usdValue: number;

    constructor(name: string, address: string, currency: Currency, balance: number, price: number) {
        this.name = name;
        this.address = address;
        this.balance = balance;
        this.currency = currency;

        this.usdValue = +(balance * price).toFixed(2)
    }
}
