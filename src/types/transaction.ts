import {Currency} from './/wallet';

/**
 * Transaction type
 * @category Models
 */
export enum TxType {
  None = 0,
  Sent,
  Received,
}

/**
 * Transaction action type
 * @category Models
 */
export enum TxAction {
  Transfer = 0,
  StakingReward,
  StakingWithdrawn,
  Staking = 3
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
  hash: string;
  userId: string | null;

  address: string;
  currency: Currency;
  action: TxAction,
  txType: TxType;
  timestamp: number;

  value: number;
  planckValue: string;
  usdValue: number;
  fullValue: string;

  fee: number;
  planckFee: string;
  usdFee: number;

  status: TxStatus;
};

