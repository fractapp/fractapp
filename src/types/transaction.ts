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
  Transfer,
  StakingReward,
  StakingCreateWithdrawalRequest,
  StakingWithdrawn,
  StakingOpenDeposit,
  StakingAddAmount,
  ConfirmWithdrawal,
  UpdateNomination
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


/**
 * @category Models
 */
export type ApiTransaction = {
  id: string;
  hash: string;
  currency: Currency;

  from: string;
  userFrom: string;

  action: TxAction,

  to: string;
  userTo: string;

  value: string;
  fee: string;
  price: number

  timestamp: number;
  status: TxStatus;
};

