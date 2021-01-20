import {Currency} from './wallet';

/**
 * @category Models
 */
export class ChatInfo {
  addressOrName: string;
  lastTxId: string;
  notificationCount: number;
  timestamp: number;
  currency?: Currency;

  constructor(
    addressOrName: string,
    lastTxId: string,
    notificationCount: number,
    timestamp: number,
    currency?: Currency,
  ) {
    this.addressOrName = addressOrName;
    this.currency = currency;
    this.lastTxId = lastTxId;
    this.notificationCount = notificationCount;
    this.timestamp = timestamp;
  }
}
