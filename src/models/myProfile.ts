/**
 * @category Models
 */
export class MyProfile {
  id: string;
  name: string;
  username: string;
  phoneNumber: string;
  email: string;
  isMigratory: boolean;
  avatarExt: string;
  lastUpdate: number;

  constructor(
    id: string,
    name: string,
    username: string,
    phoneNumber: string,
    email: string,
    isMigratory: boolean,
    avatarExt: string,
    lastUpdate: number,
  ) {
    this.id = id;
    this.name = name;
    this.username = username;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.isMigratory = isMigratory;
    this.avatarExt = avatarExt;
    this.lastUpdate = lastUpdate;
  }
}
