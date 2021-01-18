/**
 * @category Models
 */
export class AuthInfo {
  isSynced: boolean;
  isAuthed: boolean;
  isPasscode: boolean;
  isBiometry: boolean;

  constructor(
    isSynced: boolean,
    isAuthed: boolean,
    isPasscode: boolean,
    isBiometry: boolean,
  ) {
    this.isSynced = isSynced;
    this.isAuthed = isAuthed;
    this.isPasscode = isPasscode;
    this.isBiometry = isBiometry;
  }
}
