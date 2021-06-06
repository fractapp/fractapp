/**
 * @category Models
 */
export type Message = {
  id: string;
  value: string;
  timestamp: number;
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
