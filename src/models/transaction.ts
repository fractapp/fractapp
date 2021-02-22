import {Currency} from 'models/wallet';

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
export type Transaction = {
  id: string;
  userId: string | null;
  address: string;
  currency: Currency;
  txType: TxType;
  timestamp: number;
  value: number;
  usdValue: number;
  fee: number;
  usdFee: number;
  status: TxStatus;
};
