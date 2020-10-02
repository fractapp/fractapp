import { ImageSourcePropType } from "react-native";
import { Currency } from "./wallet";

export enum TxType {
    None = 0,
    Sent,
    Received
}

export class Transaction {
    id: string;
    member: string;
    currency: Currency;
    value: number;
    txType: TxType;
    date: Date;

    usdValue: number;
    symbol: string;
    logo: ImageSourcePropType;

    constructor(id: string, member: string, currency: Currency, txType: TxType, date: Date, value: number) {
        this.id = id;
        this.member = member;
        this.currency = currency;
        this.value = value;
        this.txType = txType;
        this.date = date;
        //TODO get state
        let rate = 10
        this.usdValue = value * rate
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
