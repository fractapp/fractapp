import { FileBackup } from 'models/backup';
import crypto from 'react-native-crypto';
import { mnemonicValidate } from '@polkadot/util-crypto';
import { encrypt, decrypt, getFile, getSeed, backup, BackupType, GoogleDiskFolder } from 'utils/backup';
import RNFS from 'react-native-fs';
import { signIn, safeSave } from 'utils/google'

jest.mock('react-native-fs', () => ({
    DownloadDirectoryPath: "mockDir",
    readFile: jest.fn(),
    writeFile: jest.fn()
}));
jest.mock('react-native-share', () => { });
jest.mock('@polkadot/util-crypto', () => ({
    mnemonicValidate: jest.fn(),
}));
jest.mock('utils/google', () => ({
    signIn: jest.fn(),
    safeSave: jest.fn()
}));

const algorithm = "aes-128-ctr"
const mockUpdate = jest.fn()
const mockHash = "0x0000000000000000000"
jest.mock('react-native-crypto', () => ({
    createCipher: jest.fn(),
    createDecipher: jest.fn(),
    createHash: () => ({
        update: () => ({
            digest: () => mockHash
        })
    })
}))
crypto.createCipher.mockReturnValue({
    update: mockUpdate
})
crypto.createDecipher.mockReturnValue({
    update: mockUpdate
})

it('Test encrypt', async () => {
    const encryptedSeed = "ecryptedSeed"
    const seed = "seed"
    const password = "password"
    mockUpdate.mockReturnValueOnce(encryptedSeed)
    const file = await encrypt(seed, password)

    expect(crypto.createCipher).toBeCalledWith(algorithm, password)
    expect(mockUpdate).toBeCalledWith(seed, 'utf-8', 'hex')
    expect(file.algorithm).toBe(algorithm)
    expect(file.seed).toBe(encryptedSeed)
});

it('Test decrypt', async () => {
    const encryptedSeed = "ecryptedSeed"
    const seed = "seed"
    const password = "password"
    mockUpdate.mockReturnValueOnce(seed)
    const decryptedSeed = await decrypt(new FileBackup(encryptedSeed, algorithm), password)

    expect(crypto.createDecipher).toBeCalledWith(algorithm, password)
    expect(mockUpdate).toBeCalledWith(seed, 'utf-8', 'hex')
    expect(decryptedSeed).toBe(seed)
});

it('Test get seed', async () => {
    const encryptedSeed = "ecryptedSeed"
    const seed = "seed"
    const password = "password"

    mockUpdate.mockReturnValueOnce(seed)
    mnemonicValidate.mockReturnValueOnce(true)
    const decryptedSeed = await getSeed(new FileBackup(encryptedSeed, algorithm), password)

    expect(decryptedSeed).toBe(seed)
});

it('Test get invalid seed', async () => {
    const encryptedSeed = "ecryptedSeed"
    const seed = "seed"
    const password = "password"

    mockUpdate.mockReturnValueOnce(seed)
    mnemonicValidate.mockReturnValueOnce(false)
    expect(mnemonicValidate).toBeCalled()
    expect(getSeed(new FileBackup(encryptedSeed, algorithm), password)).rejects.toThrow('invalid password')
});

it('Test get file', async () => {
    const seed = "seed"
    const fileJson = JSON.stringify(new FileBackup(seed, algorithm))

    RNFS.readFile.mockReturnValueOnce(fileJson)
    const file = await getFile("filename.json")

    expect(file.algorithm).toBe(algorithm)
    expect(file.seed).toBe(seed)
    expect(RNFS.readFile).toBeCalledWith("filename.json", "utf8")
});

it('Test backup file', async () => {
    const encryptedSeed = "ecryptedSeed"
    const seed = "seed"
    const password = "password"

    mockUpdate.mockReturnValueOnce(encryptedSeed)
    const file = await backup(seed, password, BackupType.File)
    const fileName = `fractapp-${mockHash}.json`
    expect(RNFS.writeFile).toBeCalledWith(
        `${RNFS.DownloadDirectoryPath}/${fileName}`,
        JSON.stringify(new FileBackup(encryptedSeed, algorithm)),
        "utf8"
    )

    expect(file.fileName).toBe(fileName)
    expect(file.isSuccess).toBe(true)
})

it('Test backup file throw', async () => {
    const encryptedSeed = "ecryptedSeed"
    const seed = "seed"
    const password = "password"

    mockUpdate.mockReturnValueOnce(encryptedSeed)
    RNFS.writeFile.mockImplementation(() => { throw ("error") })
    const file = await backup(seed, password, BackupType.File)

    expect(file.isSuccess).toBe(false)
})

it('Test backup google file', async () => {
    const encryptedSeed = "ecryptedSeed"
    const seed = "seed"
    const password = "password"

    safeSave.mockReturnValueOnce(true)
    mockUpdate.mockReturnValueOnce(encryptedSeed)
    const file = await backup(seed, password, BackupType.GoogleDisk)
    const fileName = `fractapp-${mockHash}.json`
    expect(safeSave).toBeCalledWith(
        GoogleDiskFolder,
        fileName,
        JSON.stringify(new FileBackup(encryptedSeed, algorithm))
    )

    expect(signIn).toBeCalled()
    expect(file.isSuccess).toBe(true)
})


it('Test backup google file error', async () => {
    const encryptedSeed = "ecryptedSeed"
    const seed = "seed"
    const password = "password"

    safeSave.mockReturnValueOnce(false)
    mockUpdate.mockReturnValueOnce(encryptedSeed)
    const file = await backup(seed, password, BackupType.GoogleDisk)
    const fileName = `fractapp-${mockHash}.json`
    expect(safeSave).toBeCalledWith(
        GoogleDiskFolder,
        fileName,
        JSON.stringify(new FileBackup(encryptedSeed, algorithm))
    )

    expect(signIn).toBeCalled()
    expect(file.isSuccess).toBe(false)
})
