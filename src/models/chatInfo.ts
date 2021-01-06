import {Currency} from './wallet';

/**
 * @category Models
 */
export class ChatInfo {
  address: string;
  currency: Currency;
  lastTxId: string;
  notificationCount: number;

  constructor(
    address: string,
    currency: Currency,
    lastTxId: string,
    notificationCount: number,
  ) {
    this.address = address;
    this.currency = currency;
    this.lastTxId = lastTxId;
    this.notificationCount = notificationCount;
  }
}