import { Profile } from 'types/profile';

/**
 * @category Models
 */
export type MessageRq = {
  version: number,
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
