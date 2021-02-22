// @ts-ignore
import crypto from 'react-native-crypto';
import {PermissionsAndroid} from 'react-native';
import {FileBackup} from 'models/backup';
import RNFS from 'react-native-fs';
import {mnemonicValidate, randomAsHex} from '@polkadot/util-crypto';
import googleUtil from 'utils/google';

/**
 * @namespace
 * @category Utils
 */
namespace Backup {
  /**
   * default google drive folder
   */
  export const GoogleDriveFolder = 'fractapp';

  /**
   * Backup type for wallet
   */
  export enum BackupType {
    File,
    GoogleDrive,
  }

  /**
   * encryption algorithm
   */
  const algorithm = 'aes-128-ctr';

  export function encrypt(seed: string, password: string): FileBackup {
    const cipher = crypto.createCipher(algorithm, password);
    return {
      seed: cipher.update(seed, 'utf-8', 'hex'),
      algorithm: algorithm,
    };
  }

  export function decrypt(file: FileBackup, password: string): string {
    const cipher = crypto.createDecipher(file.algorithm, password);
    return cipher.update(file.seed, 'hex', 'utf-8');
  }

  export function randomFilename(): string {
    return 'fractapp-' + randomAsHex(6).toLowerCase();
  }
  /**
   * backup file to phone drive or google
   */
  export async function backup(
    seed: string,
    password: string,
    fileName: string,
    type: BackupType,
  ): Promise<{isSuccess: boolean}> {
    let json = JSON.stringify(encrypt(seed, password));
    const fileNameWithType = fileName + '.json';
    switch (type) {
      case BackupType.File:
        const path = RNFS.DownloadDirectoryPath;
        const filePath = `${path}/${fileNameWithType}`;

        try {
          await RNFS.writeFile(filePath, json, 'utf8');
        } catch (e) {
          console.log(e);
          return {isSuccess: false};
        }

        break;
      case BackupType.GoogleDrive:
        await googleUtil.signIn();
        if (
          !(await googleUtil.safeSave(
            GoogleDriveFolder,
            fileNameWithType,
            json,
          ))
        ) {
          return {isSuccess: false};
        }

        break;
    }
    return {isSuccess: true};
  }

  /**
   * get the file on the device
   */
  export async function getFile(filePath: string): Promise<FileBackup> {
    const fileString = await RNFS.readFile(filePath, 'utf8');
    const file: FileBackup = JSON.parse(fileString);
    return file;
  }

  /**
   * decrypt the file and get seed
   */
  export async function getSeed(
    file: FileBackup,
    password: string,
  ): Promise<string> {
    const seed = decrypt(file, password);
    if (!mnemonicValidate(seed)) {
      throw 'invalid password';
    }
    return seed;
  }

  export const backupFile = async (
    garantedHendler: () => void,
    neverAskAgainHendler: () => void,
  ) => {
    const statuses = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    ]);
    let isGaranted = true;
    for (let key in statuses) {
      // @ts-ignore
      const status = statuses[key];
      if (status === 'granted') {
        continue;
      }

      if (status === 'never_ask_again') {
        neverAskAgainHendler();
      }

      isGaranted = false;
    }

    if (isGaranted) {
      garantedHendler();
    }
  };

  export const backupGoogleDrive = async (onSuccess: () => void) => {
    await googleUtil.signOut();
    await googleUtil.signIn();
    onSuccess();
  };
}

export default Backup;
