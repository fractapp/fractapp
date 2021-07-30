/**
 * @category Models
 */
import { Currency } from 'types/wallet';

export type User = {
  isAddressOnly: boolean
  title: string;
  value: Profile | AddressOnly
}
export type Profile = {
  id: string;
  name: string;
  username: string;
  avatarExt: string;
  lastUpdate: number;
  addresses: Record<Currency, string>;
};

export type AddressOnly = {
  address: string
  currency: Currency
}

