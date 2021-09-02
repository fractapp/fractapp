import { Profile } from 'types/profile';
import { Account } from 'types/account';

/**
 * @category Models
 */
export enum TxActionType {
  Donate = 0,
  Staking = 1,
  Undefined
}

export const getNameTxAction = (action: TxActionType): string => {
  switch (action) {
    case TxActionType.Donate:
      return 'Donate';
    case TxActionType.Staking:
      return 'Staking';
    case TxActionType.Undefined:
      return 'Undefined';
    default:
      throw new Error('invalid action');
  }
};

/**
 * @category Models
 */
export type EnterAmountInfo = {
  value: string;
  alternativeValue: number;
  usdValue: number;
  usdFee: number;
  planksValue: string;
  planksFee: string;
  isUSDMode: boolean;
  isValid: boolean;
};

/**
 * @category Models
 */
export type ConfirmTxInfo = {
  action: TxActionType;
  planksValue: string;
  creator: Profile;
  sender: Account;
  planksFee: string;
  warningText: string | null;
  errorText: string | null
}
