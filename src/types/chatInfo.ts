/**
 * @category Models
 */
import {Currency} from 'types/wallet';

export enum ChatType {
  AddressOnly,
  WithUser,
}

/**
 * @category Models
 */
export type DefaultDetails = {
  currency: Currency;
  address: string;
};

/**
 * @category Models
 */
export type ChatInfo = {
  id: string;
  name: string;
  lastTxId: string;
  lastTxCurrency: Currency;
  notificationCount: number;
  timestamp: number;
  type: ChatType;
  details: DefaultDetails | null;
};
