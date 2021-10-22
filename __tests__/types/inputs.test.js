import { TxAction } from 'types/transaction';
import { getTxName } from 'types/inputs';

test('getTxName test', () => {
  expect(getTxName(TxAction.StakingOpenDeposit)).toBe('Open deposit');
  expect(getTxName(TxAction.StakingAddAmount)).toBe('Add amount to deposit');
  expect(getTxName(TxAction.StakingReward)).toBe('Reward');
  expect(getTxName(TxAction.StakingWithdrawn)).toBe('Withdrawn');
  expect(getTxName(TxAction.StakingCreateWithdrawalRequest)).toBe('Create withdrawn request');
  expect(getTxName(TxAction.ConfirmWithdrawal)).toBe('Confirm withdrawal');
  expect(getTxName(TxAction.UpdateNomination)).toBe('Upgrade deposit settings');
  expect(getTxName(999)).toBe('Transaction');
});
