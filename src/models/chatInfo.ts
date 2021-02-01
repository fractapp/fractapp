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
export type UserDetails = {
  id: string;
  lastUpdate: number;
  avatarExt: string;
  username: string;
  addresses: Map<Currency, string>;
};

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
export class ChatInfo {
  id: string;
  name: string;
  lastTxId: string;
  lastTxCurrency: Currency;
  notificationCount: number;
  timestamp: number;
  type: ChatType;
  details: UserDetails | DefaultDetails;

  constructor(
    id: string,
    name: string,
    lastTxId: string,
    lastTxCurrency: Currency,
    notificationCount: number,
    timestamp: number,
    type: ChatType,
    details: UserDetails | DefaultDetails,
  ) {
    this.id = id;
    this.name = name;
    this.lastTxId = lastTxId;
    this.lastTxCurrency = lastTxCurrency;
    this.notificationCount = notificationCount;
    this.timestamp = timestamp;
    this.type = type;
    this.details = details;
  }
}
