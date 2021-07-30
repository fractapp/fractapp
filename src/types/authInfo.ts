/**
 * @category Models
 */
export type AuthInfo = {
  isSynced: boolean;
  hasWallet: boolean;
  hasPasscode: boolean;
  hasBiometry: boolean;
};

/**
 * @category Models
 */
export type LoadInfo = {
  isAllStatesLoaded: boolean,
  isSyncShow: boolean;
  isLoadingShow: boolean;
};
