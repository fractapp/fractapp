/**
 * @category Models
 */
export class UserProfile {
  id: string;
  name: string;
  username: string;
  avatarExt: string;
  lastUpdate: number;
  addresses: any;

  constructor(
    id: string,
    name: string,
    username: string,
    avatarExt: string,
    lastUpdate: number,
    addresses: any,
  ) {
    this.id = id;
    this.name = name;
    this.username = username;
    this.avatarExt = avatarExt;
    this.lastUpdate = lastUpdate;
    this.addresses = addresses;
  }
}
