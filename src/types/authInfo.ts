/**
 * @category Models
 */
export type AuthInfo = {
  isFirstSync: boolean;
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
