import crypto from 'react-native-crypto';
import {mnemonicValidate} from '@polkadot/util-crypto';
import backupUtil from 'utils/backup';
import RNFS from 'react-native-fs';
import googleUtil from 'utils/google';

jest.mock('react-native-fs', () => ({
  DownloadDirectoryPath: 'mockDir',
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));
jest.mock('react-native-share', () => {});
jest.mock('@polkadot/util-crypto', () => ({
  mnemonicValidate: jest.fn(),
}));
jest.mock('utils/google', () => ({
  signIn: jest.fn(),
  safeSave: jest.fn(),
}));

const algorithm = 'aes-128-ctr';
const mockUpdate = jest.fn();
const mockHash = '0x0000000000000000000';
jest.mock('react-native-crypto', () => ({
  createCipher: jest.fn(),
  createDecipher: jest.fn(),
  createHash: () => ({
    update: () => ({
      digest: () => mockHash,
    }),
  }),
}));

crypto.createCipher.mockReturnValue({
  update: mockUpdate,
});
crypto.createDecipher.mockReturnValue({
  update: mockUpdate,
});

it('Test encrypt', async () => {
  const encryptedSeed = 'ecryptedSeed';
  const seed = 'seed';
  const password = 'password';
  mockUpdate.mockReturnValueOnce(encryptedSeed);
  const file = await backupUtil.encrypt(seed, password);

  expect(crypto.createCipher).toBeCalledWith(algorithm, password);
  expect(mockUpdate).toBeCalledWith(seed, 'utf-8', 'hex');
  expect(file.algorithm).toBe(algorithm);
  expect(file.seed).toBe(encryptedSeed);
});

it('Test decrypt', async () => {
  const encryptedSeed = 'ecryptedSeed';
  const seed = 'seed';
  const password = 'password';
  mockUpdate.mockReturnValueOnce(seed);
  const decryptedSeed = await backupUtil.decrypt(
    {
      seed: encryptedSeed,
      algorithm: algorithm,
    },
    password,
  );

  expect(crypto.createDecipher).toBeCalledWith(algorithm, password);
  expect(mockUpdate).toBeCalledWith(encryptedSeed, 'hex', 'utf-8');
  expect(decryptedSeed).toBe(seed);
});

it('Test get seed', async () => {
  const encryptedSeed = 'ecryptedSeed';
  const seed = 'seed';
  const password = 'password';

  mockUpdate.mockReturnValueOnce(seed);
  mnemonicValidate.mockReturnValueOnce(true);
  const decryptedSeed = await backupUtil.getSeed(
    {
      seed: encryptedSeed,
      algorithm: algorithm,
    },
    password,
  );

  expect(decryptedSeed).toBe(seed);
});

it('Test get invalid password', async () => {
  const encryptedSeed = 'ecryptedSeed';
  const seed = 'seed';
  const password = 'password';

  mockUpdate.mockReturnValueOnce(seed);
  mnemonicValidate.mockReturnValueOnce(false);
  expect(
    backupUtil.getSeed(
      {
        seed: encryptedSeed,
        algorithm: algorithm,
      },
      password,
    ),
  ).rejects.toThrow('invalid password');
  expect(mnemonicValidate).toBeCalled();
});

it('Test get file', async () => {
  const seed = 'seed';
  const fileJson = JSON.stringify({
    seed: seed,
    algorithm: algorithm,
  });

  RNFS.readFile.mockReturnValueOnce(fileJson);
  const file = await backupUtil.getFile('filename.json');

  expect(file.algorithm).toBe(algorithm);
  expect(file.seed).toBe(seed);
  expect(RNFS.readFile).toBeCalledWith('filename.json', 'utf8');
});

it('Test backup file', async () => {
  const encryptedSeed = 'ecryptedSeed';
  const seed = 'seed';
  const password = 'password';

  mockUpdate.mockReturnValueOnce(encryptedSeed);
  const fileName = `fractapp-${mockHash}`;
  const file = await backupUtil.backup(
    seed,
    password,
    fileName,
    backupUtil.BackupType.File,
  );
  expect(RNFS.writeFile).toBeCalledWith(
    `${RNFS.DownloadDirectoryPath}/${fileName}.json`,
    JSON.stringify({
      seed: encryptedSeed,
      algorithm: algorithm,
    }),
    'utf8',
  );

  expect(file.isSuccess).toBe(true);
});

it('Test backup file throw', async () => {
  const encryptedSeed = 'ecryptedSeed';
  const seed = 'seed';
  const password = 'password';

  mockUpdate.mockReturnValueOnce(encryptedSeed);
  RNFS.writeFile.mockImplementation(() => {
    throw 'error';
  });
  const fileName = `fractapp-${mockHash}`;
  const file = await backupUtil.backup(
    seed,
    password,
    fileName,
    backupUtil.BackupType.File,
  );

  expect(file.isSuccess).toBe(false);
});

it('Test backup google file', async () => {
  const encryptedSeed = 'ecryptedSeed';
  const seed = 'seed';
  const password = 'password';

  googleUtil.safeSave.mockReturnValueOnce(true);
  mockUpdate.mockReturnValueOnce(encryptedSeed);
  const fileName = `fractapp-${mockHash}`;
  const file = await backupUtil.backup(
    seed,
    password,
    fileName,
    backupUtil.BackupType.GoogleDrive,
  );
  expect(googleUtil.safeSave).toBeCalledWith(
    backupUtil.GoogleDriveFolder,
    fileName + '.json',
    JSON.stringify({
      seed: encryptedSeed,
      algorithm: algorithm,
    }),
  );

  expect(googleUtil.signIn).toBeCalled();
  expect(file.isSuccess).toBe(true);
});

it('Test backup google file error', async () => {
  const encryptedSeed = 'ecryptedSeed';
  const seed = 'seed';
  const password = 'password';

  googleUtil.safeSave.mockReturnValueOnce(false);
  mockUpdate.mockReturnValueOnce(encryptedSeed);
  const fileName = `fractapp-${mockHash}`;
  const file = await backupUtil.backup(
    seed,
    password,
    fileName,
    backupUtil.BackupType.GoogleDrive,
  );
  expect(googleUtil.safeSave).toBeCalledWith(
    backupUtil.GoogleDriveFolder,
    fileName + '.json',
    JSON.stringify({
      seed: encryptedSeed,
      algorithm: algorithm,
    }),
  );

  expect(googleUtil.signIn).toBeCalled();
  expect(file.isSuccess).toBe(false);
});
