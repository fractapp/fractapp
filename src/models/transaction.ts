import {Currency} from './wallet';

/**
 * Transaction type
 * @category Models
 */
export enum TxType {
  None = 0,
  Sent,
  Received,
}

export enum TxStatus {
  Pending = 0,
  Success,
  Fail,
}

/**
 * @category Models
 */
export class Transaction {
  id: string;
  member: string;
  currency: Currency;
  value: number;
  txType: TxType;
  timestamp: number;
  fee: number;
  usdValue: number;
  usdFee: number;
  status: TxStatus;

  constructor(
    id: string,
    member: string,
    currency: Currency,
    txType: TxType,
    timestamp: number,
    value: number,
    usdValue: number,
    fee: number,
    usdFee: number,
    status: TxStatus,
  ) {
    this.id = id;
    this.member = member;
    this.currency = currency;
    this.value = value;
    this.txType = txType;
    this.timestamp = timestamp;
    this.fee = fee;
    this.usdValue = usdValue;
    this.usdFee = usdFee;
    this.status = status;
  }
}
