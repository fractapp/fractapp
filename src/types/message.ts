import { Profile } from 'types/profile';
import { Transaction } from 'types/transaction';

/**
 * Transaction type
 * @category Models
 */
export enum MessageAction {
  AddTxToChat = 'addTxToChat',
  ShowTx = 'tx'
}

/**
 * @category Models
 */
export type Message = {
  id: string;
  value: string;
  args: Array<string>;
  timestamp: number;
  sender: string;
};

/**
 * @category Models
 */
export type MessagesInfo = {
  messages: Array<Message>,
  users: Map<string, Profile>
  transactions:  Map<string, Transaction>
};

/**
 * @category Models
 */
export type MessageAndButtons = {
  message: Message;
  buttons: Array<Button>;
};

/**
 * @category Models
 */
export type Button = {
  id: string;
  value: string;
  onPress: () => void;
};
