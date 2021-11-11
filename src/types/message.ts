import { Profile } from 'types/profile';
import { Currency } from 'types/wallet';
import { TxAction, TxStatus, TxType } from 'types/transaction';
import { Price } from 'types/serverInfo';
import { BalanceRs } from 'types/account';

/**
 * @category Models
 */
export type MessageRq = {
  value: string,
  action: string,
  receiver: string,
  args: {
    [key in string]: string
  }
};

/**
 * @category Models
 */
export type Message = {
  id: string;
  value: string;
  action: string | null;
  args: {
    [key in string]: string
  },
  rows: Array<Row>;
  timestamp: number;
  sender: string;
  receiver: string;
  hideBtn: boolean;
};

/**
 * @category Models
 */
export type Row = {
  buttons: Array<Button>
};

/**
 * @category Models
 */
export type Button = {
  value:    string
  action:    string
  arguments: {
    [key in string]: string
  },
  imageUrl: string,
};

/**
 * @category Models
 */
export type UndeliveredMessagesInfo = {
  messages: Array<Message>,
  users: {
    [id in string]: Profile
  }
};

/**
 * @category Models
 */
export type OpenLinkArgs = {
  link: string
};

/**
 * @category Models
 */
export type EnterAmountArgs = {
  limit: string | undefined,
  currency: string,
  fee: string,
  next: string,
  arguments: string
};

/**
 * @category Models
 */
export type BroadcastArgs = {
  unsignedTx: string,
  currency: string,
  success: string,
  error: string,
  arguments: string
};


/**
 * @category Models
 */
export type TransactionViewArgs = {
  currency: string,
  id: string
};

/**
 * @category Models
 */
export enum DefaultMsgAction {
  Init = '/init',
  OpenUrl = '/openUrl',
  EnterAmount = '/enterAmount',
  Broadcast = '/broadcast',
  WalletButtonOut = '/walletOut',
  WalletButtonIn = '/walletIn'
}

/**
 * @category Models
 */
export type WsTransaction = {
  id: string;
  hash: string;
  currency: Currency;

  memberAddress: string;
  member: string | null;

  direction: TxType;
  status: TxStatus;
  action: TxAction,

  value: string;
  fee: string;
  price: number

  timestamp: number;
};

/**
 * @category Models
 */
export type WsUpdate = {
  prices: Array<Price>;
  transactions: Record<Currency, Array<WsTransaction>>,
  messages: Array<Message>,
  users: Record<string, Profile>,
  notifications: Array<string>
};


/**
 * @category Models
 */
export type WsBalanceUpdate = {
  balances: Record<Currency, BalanceRs>
};


/**
 * @category Models
 */
export type WsResponse = {
  method: string;
  value: WsUpdate | WsBalanceUpdate | Array<TxStatusApi> | Record<string, Profile>
};

/**
 * @category Models
 */
export type TxStatusApi = {
  status: TxStatus;
  hash: string;
};

