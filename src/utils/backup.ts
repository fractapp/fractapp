// @ts-ignore
import crypto from 'react-native-crypto';
import {PermissionsAndroid} from 'react-native';
import {FileBackup} from 'types/backup';
import RNFS from 'react-native-fs';
import {mnemonicValidate, randomAsHex} from '@polkadot/util-crypto';
import googleUtil from 'utils/google';
import string from 'utils/string';

/**
 * @namespace
 * @category Utils
 */
namespace Backup {
  /**
   * default google drive folder
   */
  export const GoogleDriveFolder = 'FractappWalletBackups';

  /**
   * default folder in file system
   */
  export const FSDriveFolder = 'FractappWalletBackups';
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
    return randomAsHex(6).toLowerCase();
  }

  /**
   * backup file to phone drive or google
   */
  export async function backup(
    seed: string,
    password: string,
    fileName: string,
    type: BackupType,
  ): Promise<{isExist: boolean; isError: boolean}> {
    let json = JSON.stringify(encrypt(seed, password));
    const fileNameWithType = fileName + '.json';
    switch (type) {
      case BackupType.File:
        const path = `${RNFS.ExternalStorageDirectoryPath}/${FSDriveFolder}`;

        const filePath = `${path}/${fileNameWithType}`;
        try {
          await RNFS.mkdir(path);
          const isExist = await RNFS.exists(filePath);
          if (isExist) {
            return {isError: false, isExist: true};
          }

          await RNFS.writeFile(filePath, json, 'utf8');
        } catch (e) {
          console.log(e);
          return {isError: true, isExist: false};
        }

        break;
      case BackupType.GoogleDrive:
        await googleUtil.signIn();

        const items = await googleUtil.getItems('root');
        const folder = items.find((e) => e.title === GoogleDriveFolder);
        if (folder !== undefined) {
          const files = await googleUtil.getItems(folder.id);
          let isExist = false;
          for (let file of files) {
            if (!isExist) {
              isExist = file.title === fileName + '.json';
            }
            if (isExist) {
              return {isError: false, isExist: true};
            }
          }
        }

        if (
          !(await googleUtil.safeSave(
            GoogleDriveFolder,
            fileNameWithType,
            json,
          ))
        ) {
          return {isError: true, isExist: false};
        }

        break;
    }
    return {isError: false, isExist: false};
  }

  /**
   * get the file on the device
   */
  export async function getFile(filename: string): Promise<FileBackup> {
    const path = `${RNFS.ExternalStorageDirectoryPath}/${FSDriveFolder}/${filename}`;
    const fileString = await RNFS.readFile(path, 'utf8');
    return JSON.parse(fileString);
  }

  /**
   * get the files from backup directory on the device
   */
  export async function getWalletsFromDevice(): Promise<Array<string>> {
    const path = `${RNFS.ExternalStorageDirectoryPath}/${FSDriveFolder}`;
    const wallets = [];
    try {
      const files = await RNFS.readDir(path);
      for (let file of files) {
        if (!file.isFile()) {
          continue;
        }
        const fileString = await RNFS.readFile(file.path, 'utf8');
        try {
          const wallet = <FileBackup>JSON.parse(fileString);
          if (wallet == null || wallet.seed === '' || wallet.algorithm === '') {
            continue;
          }

          wallets.push(file.name);
        } catch (e) {
          continue;
        }
      }
    } catch (e) {}
    return wallets;
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
      throw new Error('invalid password');
    }
    return seed;
  }

  export const checkPermissions = async (
    grantedHandler: () => void,
    neverAskAgainHandler: () => void,
  ) => {
    const statuses = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    ]);

    let isGranted =
      statuses[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] ===
        'granted' &&
      statuses[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
        'granted';

    if (
      statuses[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] ===
        'never_ask_again' ||
      statuses[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
        'never_ask_again'
    ) {
      neverAskAgainHandler();
    }

    if (isGranted) {
      grantedHandler();
    }
  };

  export const backupGoogleDrive = async (onSuccess: () => void) => {
    await googleUtil.signOut();
    await googleUtil.signIn();
    onSuccess();
  };

  export const getWalletsFromGoogle = async (): Promise<{
    wallets: Array<string>;
    ids: Array<string>;
  }> => {
    const items = await googleUtil.getItems('root');
    const folder = items.find((e) => e.title === GoogleDriveFolder);

    let wallets = [];
    let ids = [];
    if (folder !== undefined) {
      const files = await googleUtil.getItems(folder.id);
      for (let file of files) {
        try {
          const f = await googleUtil.getFileBackup(file.id);
          wallets.push(file.title);
          ids.push(file.id);
        } catch (e) {
          continue;
        }
      }
    }

    return {wallets: wallets, ids: ids};
  };
}

export default Backup;
