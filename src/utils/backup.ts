import crypto from 'react-native-crypto';
import { FileBackup } from 'models/backup'
import RNFS from 'react-native-fs';
import { mnemonicValidate } from '@polkadot/util-crypto';
import googleUtil from 'utils/google'

/**
 * @namespace
   * @category Utils
*/
namespace Backup {
    /**
     * default google drive folder
     */
    export const GoogleDriveFolder = "fractapp"

    /**
     * Backup type for wallet
     */
    export enum BackupType {
        File,
        GoogleDrive
    }

    /**
     * encryption algorithm
     */
    const algorithm = 'aes-128-ctr'

    export function encrypt(seed: string, password: string): FileBackup {
        const cipher = crypto.createCipher(algorithm, password)
        return new FileBackup(cipher.update(seed, 'utf-8', 'hex'), algorithm)
    }

    export function decrypt(file: FileBackup, password: string): string {
        const cipher = crypto.createDecipher(file.algorithm, password)
        return cipher.update(file.seed, 'hex', 'utf-8')
    }

    /**
     * backup file to phone drive or google
     */
    export async function backup(seed: string, password: string, type: BackupType): Promise<{ fileName: string, isSuccess: boolean }> {
        let json = JSON.stringify(encrypt(seed, password))
        let hash = crypto.createHash('sha256').update(json, 'utf8').digest('hex')
        let fileName = `fractapp-${hash}.json`
        switch (type) {
            case BackupType.File:
                // const path = Platform.OS == "ios" ? RNFS.DocumentDirectoryPath : `${RNFS.DownloadDirectoryPath}`
                const path = RNFS.DownloadDirectoryPath
                const filePath = `${path}/fractapp-${hash}.json`

                try {
                    await RNFS.writeFile(filePath, json, 'utf8')
                    /* if (Platform.OS == "ios") {
                         await Share.open({ url: `file://${filePath}` })
                         await RNFS.unlink(filePath)
                     }*/
                } catch (e) {
                    console.log(e)
                    /* if (Platform.OS == "ios")
                         await RNFS.unlink(filePath)*/
                    return { fileName: "", isSuccess: false }
                }

                break;
            case BackupType.GoogleDrive:
                await googleUtil.signIn()
                if (!await googleUtil.safeSave(GoogleDriveFolder, fileName, json))
                    return { fileName: "", isSuccess: false }

                break;
        }
        return { fileName: fileName, isSuccess: true }
    }

    /**
     * get the file on the device 
     */
    export async function getFile(filePath: string): Promise<FileBackup> {
        const fileString = await RNFS.readFile(filePath, 'utf8')
        const file: FileBackup = JSON.parse(fileString);
        return file
    }

    /**
     * decrypt the file and get seed 
     */
    export async function getSeed(file: FileBackup, password: string): Promise<string> {
        const seed = decrypt(file, password)
        if (!mnemonicValidate(seed)) {
            throw ("invalid password")
        }
        return seed
    }
}

export default Backup