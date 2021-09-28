import { Transaction, TxAction } from 'types/transaction';
import { Currency } from 'types/wallet';
import { Profile } from 'types/profile';

/**
 * @category Models
 */
export enum ConfirmTxType {
  Donate = 0,
  Staking = 1,
  Undefined
}

export const getNameTxAction = (action: ConfirmTxType): string => {
  switch (action) {
    case ConfirmTxType.Donate:
      return 'Donate';
    case ConfirmTxType.Staking:
      return 'Staking';
    case ConfirmTxType.Undefined:
      return 'Undefined';
    default:
      throw new Error('invalid action');
  }
};

export const getTxName = (action: TxAction) => {
  switch (action) {
    case TxAction.Staking:
      return 'Transfer to deposit'; //TODO go to string
    case TxAction.StakingReward:
      return 'Reward'; //TODO go to string
    case TxAction.StakingWithdrawn:
      return 'Withdrawn from deposit'; //TODO  go to string
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
  msgId: string,
  unsignedTx: any,
  tx: Transaction,
  msgArgs: Array<string>,
  action: ConfirmTxType;
  creator: Profile;
  accountCurrency: Currency;
  warningText: string | null;
  errorText: string | null
}
