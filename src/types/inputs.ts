import { Transaction, TxAction } from 'types/transaction';
import { Currency } from 'types/wallet';
import { Profile } from 'types/profile';
import { BroadcastArgs } from 'types/message';

export const getTxName = (action: TxAction) => {
  switch (action) {
    case TxAction.StakingOpenDeposit:
      return 'Open deposit'; //TODO go to string
    case TxAction.StakingAddAmount:
      return 'Add amount to deposit'; //TODO go to string
    case TxAction.StakingReward:
      return 'Deposit payout'; //TODO go to string
    case TxAction.StakingWithdrawn:
      return 'Deposit withdrawn'; //TODO  go to string
    case TxAction.StakingCreateWithdrawalRequest:
      return 'Create withdrawn request'; //TODO  go to string
    case TxAction.ConfirmWithdrawal:
      return 'Confirm withdrawal'; //TODO  go to string
    case TxAction.UpdateNomination:
      return 'Upgrade deposit settings'; //TODO  go to string
    default:
      return 'Transaction';
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
  args: BroadcastArgs,
  creator: Profile;
  accountCurrency: Currency;
  warningText: string | null;
  errorText: string | null
}
