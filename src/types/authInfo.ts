/**
 * @category Models
 */
export type AuthInfo = {
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
