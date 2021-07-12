import { Profile } from 'types/profile';


/**
 * @category Models
 */
export type MessageRq = {
  version: number,
  value: string,
  receiver: string,
  args: Array<string>
};

/**
 * @category Models
 */
export type Message = {
  id: string;
  value: string;
  args: Array<string>;
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
  arguments: Array<string>
  imageUrl: string,
};

/**
 * @category Models
 */
export type MessagesInfo = {
  messages: Array<Message>,
  user: Profile
};

/**
 * @category Models
 */
export type UndeliveredMessagesInfo = {
  messages: Array<Message>,
  users: Map<string, Profile>
};
