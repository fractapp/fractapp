import { ImageSourcePropType } from "react-native";

export enum Currency {
    Polkadot = 0,
    Kusama
}

export class Wallet {
    name: string;
    address: string;
    balance: number;
    currency: Currency;

    symbol: string;
    usdValue: number;
    logo: ImageSourcePropType;

    constructor(name: string, address: string, currency: Currency, balance: number) {
        this.name = name;
        this.address = address;
        this.balance = balance;
        this.currency = currency;
        
        //TODO get state
        let rate = 10
        this.usdValue = balance * rate
        switch (currency) {
            case Currency.Polkadot:
                this.logo = require("assets/img/dot.png")
                this.symbol = "DOT"
                break
            case Currency.Kusama:
                this.logo = require("assets/img/kusama.png")
                this.symbol = "KSM"
                break
        }

    }
}
