/**
 * @category Models
 */
import {Currency} from 'models/wallet';

export enum ChatType {
  AddressOnly,
  Chat,
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
