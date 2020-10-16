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
    fee: number;

    constructor(id: string, member: string, currency: Currency, txType: TxType, date: Date, value: number, fee: number) {
        this.id = id;
        this.member = member;
        this.currency = currency;
        this.value = value;
        this.txType = txType;
        this.date = date;
        this.fee = fee;
    }
}
